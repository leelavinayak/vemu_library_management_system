import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, X, ArrowLeft } from 'lucide-react';

const AddUser = () => {
  const navigate = useNavigate();
  const emptyForm = { 
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
  };
  const [formData, setFormData] = useState(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      toast.success('User created successfully!');
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating user');
    }
  };

  const needsAcademic = formData.role === 'student' || formData.role === 'teacher';

  return (
    <div className="fade-in">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="secondary" onClick={() => navigate('/admin/users')} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2>Create New User</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill in the details to register a new member</p>
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
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                required 
                placeholder="john@example.com"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
                required 
                placeholder="••••••••"
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
                    placeholder="e.g. STU123" 
                  />
                </div>
                <div className="form-group">
                  <label>College Name</label>
                  <input 
                    value={formData.collegeName} 
                    onChange={e => setFormData({ ...formData, collegeName: e.target.value })} 
                    placeholder="VEMU Institute"
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input 
                    value={formData.mobileNumber} 
                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} 
                    placeholder="10-digit number"
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
              <Save size={18} /> Create User
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

export default AddUser;
