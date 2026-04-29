import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ExternalLink, Globe, Share2, MessageSquare, Info, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const InstagramIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const LinkedinIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

const GithubIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useContext(AuthContext);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [recipient, setRecipient] = useState('librarian');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const payload = {
        recipientRole: recipient,
        message,
        senderName: user ? user.name : senderName,
        senderEmail: user ? user.email : senderEmail
      };
      await api.post('/api/support/message', payload);
      toast.success('Your message has been sent successfully!');
      setIsHelpOpen(false);
      setMessage('');
      setSenderName('');
      setSenderEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <footer style={{ background: '#000000', color: '#fff', paddingTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', paddingBottom: '4rem' }}>

        {/* Brand Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <img src="/vemu_logo_1.png" alt="VEMU Logo" style={{ height: '42px', width: 'auto', borderRadius: '8px', background: '#fff', padding: '4px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em', fontFamily: 'Poppins, sans-serif' }}>VEMU</span>
              <span style={{ fontWeight: 600, fontSize: '0.65rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Library System</span>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '320px' }}>
            Elevating the library experience with cutting-edge digital management. A comprehensive platform for students, faculty, and administrators.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { Icon: Globe, url: 'https://vemu.org', label: 'Website' },
              { Icon: InstagramIcon, url: 'https://www.instagram.com/vemuit/', label: 'Instagram' },
              { Icon: LinkedinIcon, url: 'https://www.linkedin.com/school/vemu-it/', label: 'LinkedIn' },
              // { Icon: GithubIcon, url: '#', label: 'Github' },
              // { Icon: MessageSquare, url: '#', label: 'Support' }
            ].map((item, idx) => (
              <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" title={item.label}
                 style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
                <item.Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>Navigation</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Student Portal', path: '/login' },
              { label: 'Faculty Access', path: '/login' },
              { label: 'Librarian Dashboard', path: '/login' },
              { label: 'Admin Console', path: '/login' },
              { label: 'Browse Collection', path: '/login' }
            ].map(link => (
              <li key={link.label}>
                <Link to={link.path} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.paddingLeft = '5px'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.paddingLeft = '0'; }}>
                  <span style={{ fontSize: '1.1rem', color: 'var(--primary)', opacity: 0.5 }}>•</span> {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>Contact Us</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                <MapPin size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</span>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, lineHeight: 1.5 }}>P.Kothakota, Chittoor District,<br />Andhra Pradesh - 517112</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                <Phone size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</span>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>+91 94406 12345</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                <Mail size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</span>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>vemupat@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem' }}>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Support & Resources</h4>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>Access user guides, system documentation, and technical support resources.</p>
          <button onClick={() => setIsHelpOpen(true)} style={{
            background: 'var(--gradient-sky)', color: '#fff', padding: '12px 24px', borderRadius: '14px',
            fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(14, 165, 233, 0.2)', border: 'none', cursor: 'pointer', width: 'fit-content'
          }}>
            Help Center <ExternalLink size={16} />
          </button>
        </div>

      </div>

      {/* Copyright Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 2rem' }}>
        <div className="container" style={{ padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center' }}>
            © {currentYear} <span style={{ color: '#fff', fontWeight: 700 }}>VEMU Institute of Technology</span>
          </p>
        </div>
      </div>

      {/* Help Center Modal */}
      {isHelpOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div style={{ background: '#fff', color: '#000', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setIsHelpOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', padding: '5px' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--accent)' }}>Help Center</h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>Send a message directly to the library staff or admin.</p>
            
            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Send to</label>
                <select value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', outline: 'none' }}>
                  <option value="librarian">Library Staff (Librarian)</option>
                  <option value="admin">System Administrator (Admin)</option>
                </select>
              </div>
              {!user && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Name</label>
                    <input 
                      type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} required
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', outline: 'none' }}
                      placeholder="John Doe"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Email</label>
                    <input 
                      type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} required
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', outline: 'none' }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Message</label>
                <textarea 
                  value={message} onChange={(e) => setMessage(e.target.value)} 
                  rows="4" required placeholder="How can we help you?"
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <button type="submit" disabled={isSending} style={{
                background: 'var(--primary)', color: '#fff', padding: '12px', borderRadius: '8px',
                fontWeight: 700, border: 'none', cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.7 : 1, marginTop: '0.5rem'
              }}>
                {isSending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
