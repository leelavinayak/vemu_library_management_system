import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import api, { BASE_URL } from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Notifications } from './StudentPortal';
import toast from 'react-hot-toast';
import { BookOpen, Edit2, Trash2, Plus, Save, X, CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react';

const getBookImage = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop';
  if (img.startsWith('http')) return img;
  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanImg = img.startsWith('/') ? img : `/${img}`;
  return `${cleanBase}${cleanImg}`;
};

const LibrarianPortal = () => {
  const links = [
    { path: '/librarian', label: 'Dashboard' },
    { path: '/librarian/borrowings', label: 'Manage Borrowings' },
    { path: '/librarian/books', label: 'Manage Books' },
    { path: '/librarian/history', label: 'History' },
    { path: '/librarian/fines', label: 'Fines' },
    { path: '/librarian/profile', label: 'Profile' },
  ];
  return (
    <div>
      <Navbar role="Librarian" links={links} />
      <div className="container page-wrapper">
        <Routes>
          <Route path="/" element={<LibrarianHome />} />
          <Route path="/borrowings" element={<LibrarianBorrowings />} />
          <Route path="/books" element={<LibrarianBooks />} />
          <Route path="/history" element={<LibrarianHistory />} />
          <Route path="/fines" element={<LibrarianFines />} />
          <Route path="/profile" element={<LibrarianProfile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </div>
  );
};

const LibrarianHome = () => {
  const [stats, setStats] = useState({ books: 0, active: 0, fines: 0, overdue: 0 });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [bRes, tRes] = await Promise.all([
        api.get('/api/books'),
        api.get('/api/transactions'),
      ]);
      const txs = tRes.data;
      const now = new Date();
      setStats({
        books: bRes.data.length,
        active: txs.filter(t => t.status === 'active').length,
        fines: txs.reduce((a, t) => a + t.fineAmount, 0),
        overdue: txs.filter(t => t.status === 'active' && now > new Date(t.expectedReturnDate)).length,
      });
      setPendingOrders(txs.filter(t => t.status === 'ordered'));
      setActiveLoans(txs.filter(t => t.status === 'active').slice(0, 5));
      setLoading(false);
    } catch (err) {
      toast.error('Error fetching dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, action) => {
    try {
      setProcessingId(id);
      await api.put(`/api/transactions/${id}/${action}`);
      toast.success(`Book marked as ${action === 'take' ? 'Taken' : 'Returned'}`);
      await fetchData();
    } catch (err) {
      toast.error(`Error processing ${action}`);
    } finally {
      setProcessingId(null);
    }
  };

  const filterData = (list) => {
    return list.filter(t => {
      const userName = t.user?.name || '';
      const bookTitle = t.book?.title || '';
      return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const filteredPending = filterData(pendingOrders);
  const filteredActive = filterData(activeLoans);

  return (
    <div>
      <div className="section-header">
        <h2>Librarian Dashboard</h2>
        <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input 
            type="text" 
            placeholder="Search orders or loans..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ paddingLeft: '38px', fontSize: '0.9rem', height: '40px' }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Books', num: stats.books, icon: <BookOpen size={40} />, color: 'var(--accent)' },
          { label: 'Active Borrowings', num: stats.active, icon: <Clock size={40} />, color: 'var(--primary)' },
          { label: 'Overdue Books', num: stats.overdue, icon: <AlertTriangle size={40} />, color: 'var(--accent)' },
          { label: 'Total Fines', num: `₹${stats.fines}`, icon: <AlertTriangle size={40} />, color: 'var(--primary)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h3>Pending Book Orders</h3>
        {pendingOrders.length > 0 && <span className="status-badge status-active">{pendingOrders.length} New</span>}
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading orders...</p></div>
      ) : filteredPending.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <CheckCircle size={32} style={{ color: 'var(--success)', opacity: 0.5 }} />
          <p style={{ fontSize: '0.9rem' }}>{searchTerm ? 'No orders match your search.' : 'No pending orders.'}</p>
        </div>
      ) : (
        <div className="table-container" style={{ marginBottom: '2.5rem' }}>
          <table>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Book Preview</th>
                <th>Book Details</th>
                <th>Order Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.map(t => (
                <tr key={t._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.user?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>ID: {t.user?.collegeId || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.user?.collegeName || '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.user?.year ? `${t.user.year}y` : ''} {t.user?.branch} {t.user?.section ? `(${t.user.section})` : ''}
                    </div>
                  </td>
                  <td>
                    <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={getBookImage(t.book?.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td><strong>{t.book?.title}</strong></td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleAction(t._id, 'take')} 
                      disabled={processingId === t._id}
                      style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                    >
                      {processingId === t._id ? 'Processing...' : 'Mark Taken'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-header">
        <h3>Books Currently Taken</h3>
        {stats.active > 0 && <span className="status-badge status-active" style={{ background: 'var(--primary)', color: '#fff' }}>{stats.active} Total</span>}
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading borrowings...</p></div>
      ) : filteredActive.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <Clock size={48} style={{ color: 'var(--text-light)', opacity: 0.5 }} />
          <p>{searchTerm ? 'No active loans match your search.' : 'No books are currently issued.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Book Preview</th>
                <th>Book Details</th>
                <th>Issued Date</th>
                <th>Return Deadline</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActive.map(t => {
                const isOverdue = new Date() > new Date(t.expectedReturnDate);
                return (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.user?.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>ID: {t.user?.collegeId || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {t.user?.collegeName || '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {t.user?.year ? `${t.user.year}y` : ''} {t.user?.branch} {t.user?.section ? `(${t.user.section})` : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={getBookImage(t.book?.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </td>
                    <td><strong>{t.book?.title}</strong></td>
                    <td>{new Date(t.issuedDate).toLocaleDateString()}</td>
                    <td style={{ color: isOverdue ? 'var(--danger)' : 'inherit', fontWeight: isOverdue ? 700 : 500 }}>
                      {new Date(t.expectedReturnDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button disabled style={{ padding: '6px 12px', fontSize: '0.82rem', background: 'var(--success)', color: '#fff', opacity: 0.7, cursor: 'not-allowed', border: 'none' }}>
                          Taken
                        </button>
                        <button 
                          onClick={() => handleAction(t._id, 'return')} 
                          disabled={processingId === t._id}
                          className="secondary" 
                          style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                        >
                          {processingId === t._id ? 'Returning...' : 'Return'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Visit <a href="/librarian/borrowings" style={{ color: 'var(--primary)', fontWeight: 600 }}>Manage Borrowings</a> to view all {stats.active} active loans.
          </p>
        </div>
      )}
    </div>
  );
};

const DEFAULT_BOOK_IMAGE = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop';

const LibrarianBooks = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const emptyForm = { title: '', author: '', isbn: '', totalCopies: 1, availableCopies: 1, imageUrl: '', loanPeriod: 14 };
  const [formData, setFormData] = useState(emptyForm);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null });


  useEffect(() => { fetchBooks(); }, []);
  const fetchBooks = async () => {
    const res = await api.get('/api/books');
    setBooks(res.data);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    try {
      setUploading(true);
      const res = await api.post('/api/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(f => ({ ...f, imageUrl: res.data.filePath }));
      toast.success('File uploaded!');
    } catch (err) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      // If no image was uploaded, use a default
      if (!submitData.imageUrl || submitData.imageUrl.trim() === '') {
        submitData.imageUrl = DEFAULT_BOOK_IMAGE;
      }
      if (editingId) {
        await api.put(`/api/books/${editingId}`, submitData);
        toast.success('Book updated!');
      } else {
        await api.post('/api/books', submitData);
        toast.success('Book added!');
      }
      setFormData(emptyForm); setEditingId(null); setShowForm(false); fetchBooks();
    } catch (err) { toast.error('Error saving book'); }
  };

  const handleEdit = (b) => {
    setFormData({ title: b.title, author: b.author, isbn: b.isbn || '', totalCopies: b.totalCopies, availableCopies: b.availableCopies, imageUrl: b.imageUrl || '', loanPeriod: b.loanPeriod || 14 });
    setEditingId(b._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    setModalConfig({ isOpen: true, id });
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/api/books/${modalConfig.id}`);
      toast.success('Book deleted');
      fetchBooks();
    } catch (err) { toast.error('Error deleting book'); }
  };

  const filtered = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="section-header">
        <h2>Manage Books</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(emptyForm); }}>
          {showForm ? <><X size={15} /> Close</> : <><Plus size={15} /> Add Book</>}
        </button>
      </div>

      {/* Inline Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search books by title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>{editingId ? 'Edit Book' : 'Add New Book'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Title</label><input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Author</label><input value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} required /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>ISBN</label><input value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Total Copies</label><input type="number" min="1" value={formData.totalCopies} onChange={e => setFormData({ ...formData, totalCopies: parseInt(e.target.value), availableCopies: parseInt(e.target.value) })} required /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Return Period (Days)</label><input type="number" min="1" value={formData.loanPeriod} onChange={e => setFormData({ ...formData, loanPeriod: parseInt(e.target.value) })} required /></div>

            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Book Cover Image</label>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Paste image URL here..."
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      style={{ fontSize: '0.9rem' }}
                    />
                    <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>OR</span>
                    <label style={{
                      margin: 0, padding: '10px 15px', background: 'var(--primary)', color: '#fff',
                      borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                    }}>
                      <Plus size={14} /> Upload File
                      <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                  {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uploading...</p>}
                  {formData.imageUrl && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                      ✓ {formData.imageUrl.startsWith('http') ? 'Source linked' : 'File uploaded'}
                    </p>
                  )}
                </div>

                <div style={{
                  width: '100px', height: '130px', borderRadius: '12px', background: '#f1f5f9',
                  border: '2px dashed var(--border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                }}>
                  {formData.imageUrl && !uploading ? (
                    formData.imageUrl.endsWith('.pdf') ? (
                      <BookOpen size={30} color="var(--primary)" />
                    ) : (
                      <img src={getBookImage(formData.imageUrl)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <BookOpen size={30} color="var(--text-light)" />
                  )}
                </div>
              </div>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '1rem' }}>
              <button type="submit" disabled={uploading}><Save size={15} /> {editingId ? 'Update' : 'Add Book'}</button>
              <button type="button" className="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}><X size={15} /> Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid">
        {filtered.map(book => (
          <div key={book._id} className="book-card">
            <div className="book-card-img-wrap">
              {book.imageUrl && book.imageUrl.endsWith('.pdf') ? (
                <div className="pdf-placeholder">
                  <BookOpen size={48} color="var(--primary)" style={{ opacity: 0.35 }} />
                  <a href={getBookImage(book.imageUrl)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>View PDF</a>
                </div>
              ) : (
                <img src={getBookImage(book.imageUrl)} alt={book.title} />
              )}
            </div>
            <div className="info">
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
              <div style={{ marginBottom: '0.75rem' }}>
                <span className={`badge-available ${book.availableCopies > 0 ? 'yes' : 'no'}`} style={{ marginBottom: '0.4rem' }}>
                  {book.availableCopies}/{book.totalCopies} Available
                </span>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={12} /> {book.loanPeriod || 14} Days Return Period
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button onClick={() => handleEdit(book)} className="secondary" style={{ flex: 1, padding: '8px' }}><Edit2 size={14} /> Edit</button>
                <button onClick={() => handleDelete(book._id)} className="danger" style={{ flex: 1, padding: '8px' }}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={executeDelete}
        title="Delete Book"
        message="Are you sure you want to remove this book from the library? This will delete all associated records."
        confirmText="Delete Book"
      />
    </div>
  );
};

const LibrarianHistory = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);

  useEffect(() => { fetchHistory(); }, []);
  const fetchHistory = async () => {
    const res = await api.get('/api/transactions');
    setHistory(res.data);
  };

  const handleReturn = async (id) => {
    try {
      await api.put(`/api/transactions/${id}/return`);
      toast.success('Book marked as returned!');
      fetchHistory();
    } catch (err) { toast.error('Error returning book'); }
  };

  const filtered = history.filter(t => {
    const bookTitle = t.book?.title || '';
    const userName = t.user?.name || '';
    return bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const displayed = limit === 'all' ? filtered : filtered.slice(0, limit);

  return (
    <div>
      <div className="section-header">
        <h2>Borrowing History</h2>
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
          <input type="text" placeholder="Search by book or user name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
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
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t.user?.role}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.user?.collegeName || '—'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {t.user?.year ? `${t.user.year}y` : ''} {t.user?.branch} {t.user?.section ? `(${t.user.section})` : ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>ID: {t.user?.collegeId || '—'}</div>
                  </td>
                  <td>
                    <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={getBookImage(t.book?.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  <td>
                    {t.status === 'active' && (
                      <button onClick={() => handleReturn(t._id)} className="success" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                        <CheckCircle size={13} /> Return
                      </button>
                    )}
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

const LibrarianBorrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

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
      setProcessingId(id);
      await api.put(`/api/transactions/${id}/${action}`);
      toast.success(`Book marked as ${action === 'take' ? 'Taken' : 'Returned'}`);
      await fetchBorrowings();
    } catch (err) {
      toast.error(`Error processing ${action}`);
    } finally {
      setProcessingId(null);
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
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>ID: {t.user?.collegeId || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.user?.collegeName || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.user?.year ? `${t.user.year}y` : ''} {t.user?.branch} {t.user?.section ? `(${t.user.section})` : ''}
                    </div>
                  </td>
                  <td>
                    <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={getBookImage(t.book?.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                      <button 
                        onClick={() => handleAction(t._id, 'take')} 
                        disabled={processingId === t._id}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        {processingId === t._id ? 'Taking...' : 'Mark Taken'}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button disabled style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'var(--success)', color: '#fff', opacity: 0.7, cursor: 'not-allowed', border: 'none', borderRadius: '4px' }}>
                          Taken
                        </button>
                        <button 
                          onClick={() => handleAction(t._id, 'return')} 
                          disabled={processingId === t._id}
                          className="secondary" 
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          {processingId === t._id ? 'Returning...' : 'Return'}
                        </button>
                      </div>
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

const LibrarianFines = () => {
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
        <h2>Fines Management</h2>
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
          <thead><tr><th>Student</th><th>Book</th><th>Fine</th><th>Return Date</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t._id}>
                <td><strong>{t.user?.name}</strong></td>
                <td>{t.book?.title}</td>
                <td><span style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{t.fineAmount}</span></td>
                <td>{t.returnDate ? new Date(t.returnDate).toLocaleDateString() : '—'}</td>
                <td><span className={`status-badge ${t.status === 'active' ? 'status-overdue' : 'status-completed'}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LibrarianProfile = () => {
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
                  <div className="profile-field-v2"><span className="label">College ID</span><span className="value" style={{ fontWeight: 700, color: 'var(--primary)' }}>{user?.collegeId || 'Not set'}</span></div>
                  <div className="profile-field-v2"><span className="label">Mobile</span><span className="value">{user?.mobileNumber || 'Not provided'}</span></div>
                  <div className="profile-field-v2"><span className="label">Account Type</span><span className="value" style={{ textTransform: 'capitalize' }}>{user?.role}</span></div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institution Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="profile-field-v2"><span className="label">College</span><span className="value">{user?.collegeName || '—'}</span></div>
                  <div className="profile-field-v2"><span className="label">Department</span><span className="value">Library Administration</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarianPortal;
