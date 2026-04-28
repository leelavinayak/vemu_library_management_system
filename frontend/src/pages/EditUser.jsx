import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    year: '',
    branch: '',
    section: '',
    collegeName: '',
    collegeId: '',
    mobileNumber: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
        const u = res.data;
        setFormData({
          name: u.name || '',
          email: u.email || '',
          password: '',
          role: u.role || 'student',
          year: u.year || '',
          branch: u.branch || '',
          section: u.section || '',
          collegeName: u.collegeName || '',
          collegeId: u.collegeId || '',
          mobileNumber: u.mobileNumber || ''
        });
        setLoading(false);
      } catch (err) {
        toast.error('Error fetching user details');
        navigate('/admin/users');
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Only include password if it's not empty
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.password) delete dataToSubmit.password;

      await axios.put(`http://localhost:5000/api/users/${id}`, dataToSubmit);
      toast.success('User updated successfully!');
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating user');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary)" />
    </div>
  );

  const needsAcademic = formData.role === 'student' || formData.role === 'teacher';

  return (
    <div className="fade-in">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="secondary" onClick={() => navigate('/admin/users')} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2>Edit User Details</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Modify profile and academic information</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>New Password (Optional)</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select 
                value={formData.role} 
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>

              <>
                <div className="form-group">
                  <label>College ID</label>
                  <input 
                    value={formData.collegeId} 
                    onChange={e => setFormData({ ...formData, collegeId: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>College Name</label>
                  <input 
                    value={formData.collegeName} 
                    onChange={e => setFormData({ ...formData, collegeName: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input 
                    value={formData.mobileNumber} 
                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} 
                  />
                </div>
                {formData.role === 'student' && (
                  <>
                    <div className="form-group">
                      <label>Year</label>
                      <select value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })}>
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Branch</label>
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
                      <label>Section</label>
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
                  </>
                )}
              </>


          </div>

          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <button type="submit" style={{ flex: 1, justifyContent: 'center' }}>
              <Save size={18} /> Update User
            </button>
            <button 
              type="button" 
              className="ghost" 
              onClick={() => navigate('/admin/users')}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
