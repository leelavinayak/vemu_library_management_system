import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import api, { BASE_URL } from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Notifications } from './StudentPortal';
import toast from 'react-hot-toast';
import { Users, BookOpen, AlertTriangle, Edit2, Trash2, Plus, Save, X, Search, Clock, ArrowLeft, Download } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AddUser from './AddUser';
import EditUser from './EditUser';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop';

const getBookImage = (img) => {
  if (!img || img.trim() === '') return FALLBACK_IMG;
  if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) return img;
  const cleanBase = (import.meta.env.VITE_API_URL || 'https://vemu-library-management-system-ni7c.onrender.com').replace(/\/$/, '');
  const cleanImg = img.startsWith('/') ? img : `/${img}`;
  return `${cleanBase}${cleanImg}`;
};

const AdminPortal = () => {
  const links = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/borrowings', label: 'Manage Borrowings' },
    { path: '/admin/history', label: 'History' },
    { path: '/admin/fines', label: 'Fines' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/profile', label: 'Profile' },
  ];
  return (
    <div>
      <Navbar role="Admin" links={links} />
      <div className="container page-wrapper">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/borrowings" element={<AdminBorrowings />} />
          <Route path="/history" element={<AdminHistory />} />
          <Route path="/fines" element={<AdminFines />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/users/edit/:id" element={<EditUser />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </div>
  );
};

const AdminHome = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, fined: 0, totalFine: 0 });
  const [studentsWithFines, setStudentsWithFines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/users'),
      api.get('/api/transactions'),
    ]).then(([uRes]) => {
      const users = uRes.data;
      const fined = users.filter(u => u.role === 'student' && u.fineAmount > 0);
      setStudentsWithFines(fined);
      setStats({
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        fined: fined.length,
        totalFine: fined.reduce((a, u) => a + u.fineAmount, 0),
      });
    });
  }, []);

  const filtered = studentsWithFines.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="section-header"><h2>Admin Dashboard</h2></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Students', num: stats.students, icon: <Users size={40} />, color: 'var(--accent)' },
          { label: 'Total Teachers', num: stats.teachers, icon: <Users size={40} />, color: 'var(--primary)' },
          { label: 'Students with Fines', num: stats.fined, icon: <AlertTriangle size={40} />, color: 'var(--accent)' },
          { label: 'Total Fine Pending', num: `₹${stats.totalFine}`, icon: <AlertTriangle size={40} />, color: 'var(--primary)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Students with Pending Fines</h3>

      {/* Inline Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem' }}><p>No students have pending fines.</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Fine Amount</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.email}</td>
                  <td><span style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{s.fineAmount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminHistory = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);
  const [filterYear, setFilterYear] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterSection, setFilterSection] = useState('all');

  useEffect(() => {
    api.get('/api/transactions').then(res => setHistory(res.data));
  }, []);

  const filtered = history.filter(t => {
    const bookTitle = t.book?.title || '';
    const userName = t.user?.name || '';
    const userYear = t.user?.year?.toString() || '';
    const userBranch = t.user?.branch || '';
    const userSection = t.user?.section || '';

    const matchesSearch = 
      bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesYear = filterYear === 'all' || userYear === filterYear;
    const matchesBranch = filterBranch === 'all' || userBranch === filterBranch;
    const matchesSection = filterSection === 'all' || userSection === filterSection;

    return matchesSearch && matchesYear && matchesBranch && matchesSection;
  });

  const handleExport = () => {
    const exportData = filtered.map(t => ({
      'Transaction ID': t._id,
      'User Name': t.user?.name || '',
      'Email': t.user?.email || '',
      'Role': t.user?.role || '',
      'College ID': t.user?.collegeId || '',
      'College Name': t.user?.collegeName || '',
      'Year': t.user?.year || '',
      'Branch': t.user?.branch || '',
      'Section': t.user?.section || '',
      'Book Title': t.book?.title || '',
      'Book Author': t.book?.author || '',
      'Status': t.status === 'ordered' ? 'ORDERED' : (t.status === 'active' ? 'TAKEN' : t.status),
      'Order/Issued Date': t.status === 'ordered' ? new Date(t.createdAt).toLocaleDateString() : (t.issuedDate ? new Date(t.issuedDate).toLocaleDateString() : ''),
      'Expected Return Date': t.status === 'active' && t.expectedReturnDate ? new Date(t.expectedReturnDate).toLocaleDateString() : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'History_Details');
    XLSX.writeFile(workbook, `History_Details_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const displayed = limit === 'all' ? filtered : filtered.slice(0, limit);

  return (
    <div>
      <div className="section-header">
        <h2>All Transactions</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Show:</span>
          <select
            value={limit}
            onChange={e => setLimit(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: '400px', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search by book or user name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ maxWidth: '120px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option value="all">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} style={{ maxWidth: '150px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option value="all">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="Civil">Civil</option>
          <option value="Mech">Mech</option>
          <option value="AIML">AIML</option>
          <option value="AI">AI</option>
          <option value="IT">IT</option>
          <option value="Diploma">Diploma</option>
          <option value="MCA">MCA</option>
          <option value="MBA">MBA</option>
        </select>
        <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{ maxWidth: '120px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option value="all">All Sections</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
        </select>
        <button onClick={handleExport} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px' }}>
          <Download size={16} /> Export
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>User Details</th><th>Institution & Academic Info</th><th>Book Preview</th><th>Book</th><th>Issued</th><th>Returned</th><th>Status</th></tr></thead>
          <tbody>
            {displayed.map(t => {
              const isOverdue = t.status === 'active' && new Date() > new Date(t.expectedReturnDate);
              return (
                <tr key={t._id}>
                  <td>
                    <strong>{t.user?.name}</strong><br />
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t.user?.role}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.user?.collegeName || '—'}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {t.user?.year ? `${t.user.year}y` : ''} {t.user?.branch} {t.user?.section ? `(${t.user.section})` : ''}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>ID: {t.user?.collegeId || '—'}</div>
                  </td>
                  <td>
                    <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      {t.book?.imageUrl && (t.book.imageUrl.endsWith('.pdf') || t.book.imageUrl.includes('application/pdf')) ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                          <BookOpen size={20} color="var(--primary)" />
                        </div>
                      ) : (
                        <img src={getBookImage(t.book?.imageUrl)} alt="" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"; }} style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "#f8fafc" }} />
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{t.book?.title}</td>
                  <td>{t.issuedDate ? new Date(t.issuedDate).toLocaleDateString() : <span style={{ color: 'var(--text-muted)' }}>Pending</span>}</td>
                  <td>{t.returnDate ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>{new Date(t.returnDate).toLocaleDateString()}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>
                    <span className={`status-badge ${
                      t.status === 'active' ? (isOverdue ? 'status-overdue' : 'status-active') : 
                      t.status === 'ordered' ? 'status-active' : 'status-completed'
                    }`}>
                      {t.status === 'active' ? (isOverdue ? 'Overdue' : 'Active') : 
                       t.status === 'ordered' ? 'Ordered' : 'Returned'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminFines = () => {
  const [fines, setFines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/api/transactions').then(res => setFines(res.data.filter(t => t.fineAmount > 0)));
  }, []);

  const filtered = fines.filter(t => {
    const bookTitle = t.book?.title || '';
    const userName = t.user?.name || '';
    return bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const total = fines.reduce((a, t) => a + t.fineAmount, 0);

  return (
    <div>
      <div className="section-header">
        <h2>Fines Overview</h2>
        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '5px 16px', borderRadius: '99px', fontWeight: 700 }}>Total: ₹{total}</span>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search by book or student name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Student</th><th>Book</th><th>Fine</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t._id}>
                <td><strong>{t.user?.name}</strong></td>
                <td>{t.book?.title}</td>
                <td><span style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{t.fineAmount}</span></td>
                <td><span className={`status-badge ${t.status === 'active' ? 'status-overdue' : 'status-completed'}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null });
  const navigate = useNavigate();

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => {
    const res = await api.get('/api/users');
    setUsers(res.data.filter(u => u.role !== 'admin'));
  };

  const handleDelete = async (id) => {
    setModalConfig({ isOpen: true, id });
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/api/users/${modalConfig.id}`);
      toast.success('User deleted'); 
      fetchUsers();
    } catch (err) { toast.error('Error deleting user'); }
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const displayed = limit === 'all' ? filtered : filtered.slice(0, limit);

  return (
    <div>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>User Management</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Show:</span>
            <select
              value={limit}
              onChange={e => setLimit(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', outline: 'none' }}
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
        <Link to="/admin/users/add" className="button-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, textDecoration: 'none' }}>
          <Plus size={18} /> Add User
        </Link>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Name / ID</th><th>Email / Mobile</th><th>Role</th><th>College</th><th>Actions</th></tr></thead>
          <tbody>
            {displayed.map(u => (
              <tr key={u._id}>
                <td>
                  <strong>{u.name}</strong><br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{u.collegeId || 'No ID'}</span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {u.email}<br />
                  {u.mobileNumber && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{u.mobileNumber}</span>}
                </td>
                <td><span style={{ textTransform: 'capitalize', background: '#eff6ff', color: '#1d4ed8', padding: '2px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600 }}>{u.role}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.collegeName || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigate(`/admin/users/edit/${u._id}`)} className="secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(u._id)} className="danger" style={{ padding: '6px 12px', fontSize: '0.82rem' }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={executeDelete}
        title="Delete User"
        message="Are you sure you want to remove this user from the system? This action cannot be undone."
        confirmText="Delete User"
      />
    </div>
  );
};

const AdminProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  useEffect(() => { if (user) setFormData({ name: user.name, email: user.email, collegeName: user.collegeName || '', collegeId: user.collegeId || '', mobileNumber: user.mobileNumber || '' }); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/users/${user.id || user._id}`, formData);
      setUser({ ...user, ...formData });
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch (err) { toast.error('Error updating profile'); }
  };

  return (
    <div>
      <div className="section-header">
        <h2>My Account</h2>
        <button onClick={() => setIsEditing(!isEditing)} className={isEditing ? 'ghost' : 'secondary'}>
          {isEditing ? <><X size={15} /> Cancel</> : <><Edit2 size={15} /> Edit Profile</>}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: '120px', background: 'linear-gradient(135deg, #000 0%, #334155 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '-40px', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '24px', background: '#fff',
              padding: '4px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '20px', background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                fontSize: '2.5rem', fontWeight: 800
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '3.5rem 2rem 2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user?.name}</h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{user?.email}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></span>
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Administrator</span>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="form-group"><label>Full Name</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="form-group"><label>Email Address</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
                <div className="form-group"><label>College Name</label><input value={formData.collegeName} onChange={e => setFormData({ ...formData, collegeName: e.target.value })} /></div>
                <div className="form-group"><label>College ID</label><input value={formData.collegeId} onChange={e => setFormData({ ...formData, collegeId: e.target.value })} /></div>
                <div className="form-group"><label>Mobile Number</label><input value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit"><Save size={15} /> Save Changes</button>
                <button type="button" className="ghost" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="profile-field-v2"><span className="label">Name</span><span className="value">{user?.name}</span></div>
                  <div className="profile-field-v2"><span className="label">Email</span><span className="value">{user?.email}</span></div>
                  <div className="profile-field-v2"><span className="label">Mobile</span><span className="value">{user?.mobileNumber || 'Not provided'}</span></div>
                  <div className="profile-field-v2"><span className="label">College ID</span><span className="value">{user?.collegeId || 'Not provided'}</span></div>
                  <div className="profile-field-v2"><span className="label">Account Status</span><span className="value" style={{ color: 'var(--success)' }}>Active Admin</span></div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Management</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="profile-field-v2"><span className="label">Organization</span><span className="value">{user?.collegeName || 'VEMU Institutions'}</span></div>
                  <div className="profile-field-v2"><span className="label">System Role</span><span className="value">Super Administrator</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminBorrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchBorrowings = async () => {
    try {
      const res = await api.get('/api/transactions');
      setBorrowings(res.data.filter(t => t.status !== 'completed'));
      setLoading(false);
    } catch (err) {
      toast.error('Error fetching borrowings');
      setLoading(false);
    }
  };

  useEffect(() => { fetchBorrowings(); }, []);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/api/transactions/${id}/${action}`);
      toast.success(`Book marked as ${action === 'take' ? 'Taken' : 'Returned'}`);
      fetchBorrowings();
    } catch (err) {
      toast.error(`Error processing ${action}`);
    }
  };

  const filtered = borrowings.filter(t => {
    const bookTitle = t.book?.title || '';
    const userName = t.user?.name || '';
    const matchesSearch = 
      bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Manage Borrowings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track and manage book orders and active loans</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: '400px', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search student or book..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="all">All Active / Ordered</option>
          <option value="ordered">Orders Only</option>
          <option value="active">Active Loans</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading records...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><BookOpen size={48} /><p>No matching borrowings found.</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Preview</th>
                <th>Book Details</th>
                <th>Date / Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.user?.email} • <span style={{ textTransform: 'capitalize' }}>{t.user?.role}</span></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.user?.collegeName || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.user?.year ? `${t.user.year}y` : ''} {t.user?.branch} {t.user?.section ? `(${t.user.section})` : ''}
                    </div>
                  </td>
                  <td>
                    <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      {t.book?.imageUrl && (t.book.imageUrl.endsWith('.pdf') || t.book.imageUrl.includes('application/pdf')) ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                          <BookOpen size={20} color="var(--primary)" />
                        </div>
                      ) : (
                        <img src={getBookImage(t.book?.imageUrl)} alt="" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"; }} style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "#f8fafc" }} />
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{t.book?.title}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {t.status === 'ordered' ? 'Ordered: ' : 'Taken: '}
                      {new Date(t.status === 'ordered' ? t.createdAt : t.issuedDate).toLocaleDateString()}
                    </div>
                    {t.status === 'active' && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>Due: {new Date(t.expectedReturnDate).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td>
                    <span className={`badge-available ${t.status === 'active' ? 'yes' : 'no'}`} style={{ margin: 0, padding: '4px 12px', background: t.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: t.status === 'active' ? '#15803d' : '#b45309', border: 'none' }}>
                      {t.status === 'ordered' ? 'ORDERED' : 'TAKEN'}
                    </span>
                  </td>
                  <td>
                    {t.status === 'ordered' ? (
                      <button onClick={() => handleAction(t._id, 'take')} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Mark Taken</button>
                    ) : (
                      <button onClick={() => handleAction(t._id, 'return')} className="secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Mark Returned</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
