import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './Login.css';

const Login = () => {
  const [step, setStep] = useState('login'); // 'login', 'forgot', 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role) navigate(`/${user.role.toLowerCase()}`);
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === 'login') {
        const u = await login(email, password);
        toast.success(`Welcome back, ${u.name}!`);
        const role = u.role ? u.role.toLowerCase() : 'student';
        navigate(`/${role}`);
      } else if (step === 'forgot') {
        const res = await api.post('/api/auth/forgot-password', { email });
        toast.success(res.data.message);
        setStep('otp');
      } else if (step === 'otp') {
        const res = await api.post('/api/auth/reset-password', { 
          email, 
          otp, 
          newPassword 
        });
        toast.success(res.data.message);
        setStep('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Ornaments */}
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      <div className="login-card">
        <div className="login-header">
           <img src="/vemu_logo_1.png" alt="VEMU Logo" className="login-logo" />
           <h2 className="login-title">
             {step === 'login' ? 'VEMU Library' : step === 'forgot' ? 'Reset Access' : 'Verify Identity'}
           </h2>
           <p className="login-subtitle">
             {step === 'login' ? 'Enter your credentials to continue' : 
              step === 'forgot' ? 'We will send a 6-digit verification code' : 
              'Check your email and mobile for the code'}
           </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Field (Shown in Login and Forgot steps) */}
          {(step === 'login' || step === 'forgot') && (
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="name@vemu.edu.in" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="login-input"
                />
              </div>
            </div>
          )}

          {/* Password Field (Login step only) */}
          {step === 'login' && (
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                <button 
                  type="button" 
                  onClick={() => setStep('forgot')} 
                  className="forgot-link"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input 
                  type={showPass ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="login-input"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="password-toggle"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* OTP and New Password Fields (OTP step only) */}
          {step === 'otp' && (
            <>
              <div className="input-group">
                <label className="input-label">Verification Code</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="000000" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    required 
                    maxLength={6}
                    className="login-input otp-input"
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">New Password</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    className="login-input"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)} 
                    className="password-toggle"
                  >
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="submit-btn"
          >
            {loading ? (step === 'login' ? 'Authenticating...' : 'Processing...') : (
              <>
                {step === 'login' ? 'Sign In' : step === 'forgot' ? 'Send OTP' : 'Update Password'}
                {step === 'login' && <ArrowRight size={20} />}
              </>
            )}
          </button>

          {step !== 'login' && (
            <button 
              type="button" 
              onClick={() => setStep('login')} 
              className="back-btn"
            >
              <ArrowLeft size={18} />
              Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
