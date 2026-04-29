import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { BASE_URL } from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Notifications } from './StudentPortal';
import toast from 'react-hot-toast';
import { BookOpen, Bell, Clock, Edit2, Save, X, Search } from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop';

const getBookImage = (img) => {
  if (!img || img.trim() === '') return FALLBACK_IMG;
  if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) return img;
  const cleanBase = (import.meta.env.VITE_API_URL || 'https://vemu-library-management-system-ni7c.onrender.com').replace(/\/$/, '');
  const cleanImg = img.startsWith('/') ? img : `/${img}`;
  return `${cleanBase}${cleanImg}`;
};

const TeacherPortal = () => {
  const links = [
    { path: '/teacher', label: 'Home' },
    { path: '/teacher/history', label: 'History' },
    { path: '/teacher/profile', label: 'Profile' },
  ];
  return (
    <div>
      <Navbar role="Teacher" links={links} />
      <div className="container page-wrapper">
        <Routes>
          <Route path="/" element={<TeacherHome />} />
          <Route path="/history" element={<TeacherHistory />} />
          <Route path="/profile" element={<TeacherProfile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </div>
  );
};

const TeacherHome = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/books')
      .then(res => { setBooks(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleBook = async (bookId) => {
    try {
      await api.post('/api/transactions', { bookId });
      toast.success('Book issued successfully!');
      const res = await api.get('/api/books');
      setBooks(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error booking book');
    }
  };

  const handleNotify = async (bookId) => {
    try {
      await api.post('/api/notifications/request', { bookId });
      toast.success('You will be notified when this book is available!');
    } catch (err) { toast.error('Error requesting notification'); }
  };

  const filtered = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Browse Books</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{filtered.length} books available</p>
        </div>
      </div>

      {/* Inline Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search books by title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading books...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><BookOpen size={48} /><p>No books found.</p></div>
      ) : (
        <div className="grid">
          {filtered.map(book => (
            <div key={book._id} className="book-card">
              <div className="book-card-img-wrap">
                {book.imageUrl && (book.imageUrl.endsWith('.pdf') || book.imageUrl.includes('application/pdf')) ? (
                  <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-subtle)' }}>
                    <BookOpen size={48} color="var(--primary)" style={{ opacity: 0.4 }} />
                    <a href={getBookImage(book.imageUrl)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>View PDF</a>
                  </div>
                ) : (
                  <img src={getBookImage(t.book?.imageUrl)} alt="" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
              <div className="info">
                <h3 style={{ marginBottom: '0.3rem' }}>{book.title}</h3>
                <p style={{ fontSize: '0.82rem' }}>by {book.author}</p>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span className={`badge-available ${book.availableCopies > 0 ? 'yes' : 'no'}`} style={{ marginBottom: '0.4rem' }}>
                    {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Not Available'}
                  </span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={12} /> {book.loanPeriod || 14} Days Return Period
                  </div>
                </div>
                <div style={{ marginTop: 'auto' }}>
                  {book.availableCopies > 0 ? (
                    <button onClick={() => handleBook(book._id)} style={{ width: '100%', padding: '10px' }}>
                      <BookOpen size={15} /> Issue Book
                    </button>
                  ) : (
                    <button onClick={() => handleNotify(book._id)} className="ghost" style={{ width: '100%', padding: '10px' }}>
                      <Bell size={15} /> Notify Me
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TeacherHistory = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    api.get('/api/transactions').then(res => setHistory(res.data));
  }, []);

  const filtered = history.filter(t =>
    t.book?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayed = limit === 'all' ? filtered : filtered.slice(0, limit);

  return (
    <div>
      <div className="section-header">
        <h2>My Borrowing History</h2>
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

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search history by book title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-state"><Clock size={48} /><p>No borrowing history yet.</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Search size={48} /><p>No matching history found.</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Book</th><th>Preview</th><th>College</th><th>Issued Date</th><th>Expected Return</th><th>Actual Return</th><th>Status</th></tr></thead>
            <tbody>
              {displayed.map(t => {
                const isOverdue = t.status === 'active' && new Date() > new Date(t.expectedReturnDate);
                return (
                  <tr key={t._id}>
                    <td><strong>{t.book?.title}</strong></td>
                    <td>
                      <div style={{ width: '45px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        {t.book?.imageUrl && (t.book.imageUrl.endsWith('.pdf') || t.book.imageUrl.includes('application/pdf')) ? (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                            <BookOpen size={20} color="var(--primary)" />
                          </div>
                        ) : (
                          <img src={getBookImage(t.book?.imageUrl)} alt="" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{t.user?.collegeName || '—'}</td>
                    <td>{new Date(t.issuedDate).toLocaleDateString()}</td>
                    <td style={{ color: isOverdue ? 'var(--danger)' : 'inherit' }}>{new Date(t.expectedReturnDate).toLocaleDateString()}</td>
                    <td>{t.returnDate ? new Date(t.returnDate).toLocaleDateString() : <span style={{ color: 'var(--text-light)' }}>—</span>}</td>
                    <td><span className={`status-badge ${t.status === 'active' ? (isOverdue ? 'status-overdue' : 'status-active') : 'status-completed'}`}>{t.status === 'active' ? (isOverdue ? 'Overdue' : 'Active') : 'Returned'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TeacherProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  useEffect(() => {
    if (user) setFormData({ name: user.name, email: user.email, collegeName: user.collegeName || '', collegeId: user.collegeId || '', mobileNumber: user.mobileNumber || '', year: user.year || '', branch: user.branch || '', section: user.section || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/users/${user.id || user._id}`, formData);
      setUser({ ...user, ...formData });
      toast.success('Profile updated successfully!');
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
        <div style={{ height: '120px', background: 'var(--gradient-sky)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '-40px', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '24px', background: '#fff',
              padding: '4px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '20px', background: 'var(--accent)',
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
              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{user?.role}</span>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="form-group"><label>Full Name</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="form-group"><label>Email Address</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
                <div className="form-group"><label>College ID</label><input value={formData.collegeId} onChange={e => setFormData({ ...formData, collegeId: e.target.value })} /></div>
                <div className="form-group"><label>College Name</label><input value={formData.collegeName} onChange={e => setFormData({ ...formData, collegeName: e.target.value })} /></div>
                <div className="form-group"><label>Mobile Number</label><input value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} /></div>
                <div className="form-group">
                  <label>Year (Optional)</label>
                  <select value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })}>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Branch (Optional)</label>
                  <select value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                    <option value="">Select Branch</option>
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
                </div>
                <div className="form-group">
                  <label>Section (Optional)</label>
                  <select value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}>
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                  </select>
                </div>
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
                  <div className="profile-field-v2"><span className="label">College ID</span><span className="value" style={{ fontWeight: 700, color: 'var(--primary)' }}>{user?.collegeId || 'Not set'}</span></div>
                  <div className="profile-field-v2"><span className="label">Email</span><span className="value">{user?.email}</span></div>
                  <div className="profile-field-v2"><span className="label">Mobile</span><span className="value">{user?.mobileNumber || 'Not provided'}</span></div>
                  <div className="profile-field-v2"><span className="label">Account Type</span><span className="value" style={{ textTransform: 'capitalize' }}>{user?.role}</span></div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academic Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="profile-field-v2"><span className="label">College</span><span className="value">{user?.collegeName || '—'}</span></div>
                  <div className="profile-field-v2"><span className="label">Branch</span><span className="value">{user?.branch || '—'}</span></div>
                  <div className="profile-field-v2"><span className="label">Year / Section</span><span className="value">{user?.year ? `${user.year} / ${user.section || '—'}` : '—'}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;
