import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, Menu, X, LogOut, User } from 'lucide-react';
import axios from 'axios';

const Navbar = ({ role, links }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications');
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (err) { }
    };
    if (user) fetchNotifications();
    const interval = setInterval(() => { if (user) fetchNotifications(); }, 30000);
    return () => clearInterval(interval);
  }, [user, location]);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredLinks = links ? links.filter(l => l.label.toLowerCase() !== 'profile') : [];
  const profilePath = `/${user?.role?.toLowerCase()}/profile`;

  return (
    <nav className="navbar" style={{ position: 'relative' }}>
      <div className="navbar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 1rem' }}>

        {/* Left: Logo */}
        <Link to={user ? `/${user.role?.toLowerCase()}` : '/'} className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <img src="/vemu_logo_1.png" alt="VEMU" style={{ height: '32px', width: 'auto', borderRadius: '4px' }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', display: 'inline-block' }}>VEMU</span>
        </Link>

        {/* Center: Desktop Nav (Hidden on Mobile) */}
        <div className="desktop-only" style={{ display: 'flex', gap: '0.5rem', margin: '0 1rem' }}>
          {filteredLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
              style={{ padding: '8px 16px', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 600 }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user && (
            <button
              onClick={() => navigate(`/${user.role?.toLowerCase()}/notifications`)}
              className="notification-icon"
              style={{ background: 'transparent', color: '#fff', position: 'relative', padding: '8px' }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px', background: '#ef4444',
                  color: '#fff', fontSize: '10px', fontWeight: 800, borderRadius: '50%',
                  width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #000'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Pill (Hidden on extreme small screens) */}
          {user && (
            <Link to={profilePath} className="desktop-only user-profile-pill" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user.name}</span>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </Link>
          )}

          {user && (
            <button onClick={handleLogout} className="desktop-only logout-btn" style={{ padding: '8px 16px' }}>
              <LogOut size={16} /> Logout
            </button>
          )}

          {!user && (
            <Link to="/login">
              <button style={{ padding: '8px 20px', borderRadius: '99px' }}>Login</button>
            </Link>
          )}

          {/* THE HAMBURGER (Visible only on Mobile) */}
          <button
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', padding: '8px', color: '#fff', display: 'none'
            }}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: 'fixed', top: '72px', left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1001 }}
          />
          <div style={{
            position: 'absolute', top: '72px', left: 0, right: 0, background: '#000',
            borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', zIndex: 1002,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={location.pathname === link.path ? 'active' : ''}
                  style={{
                    padding: '14px 18px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
                    background: location.pathname === link.path ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  {link.label}
                  <div style={{ opacity: 0.5 }}>→</div>
                </Link>
              ))}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
              {user && (
                <>
                  <Link
                    to={profilePath}
                    style={{
                      padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                      background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '1rem', fontWeight: 600
                    }}
                  >
                    <User size={18} /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', justifyContent: 'flex-start', padding: '14px 18px',
                      borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '1rem'
                    }}
                  >
                    <LogOut size={18} /> Logout Session
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
