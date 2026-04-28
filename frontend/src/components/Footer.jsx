import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Github, ExternalLink, Globe, Share2, MessageSquare, Info } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: '#0f172a', color: '#fff', paddingTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
            {[Globe, Share2, MessageSquare, Github, Info].map((Icon, idx) => (
              <a key={idx} href="#" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                 onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                 onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
                <Icon size={18} />
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
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>library@vemu.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem' }}>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Support & Resources</h4>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>Access user guides, system documentation, and technical support resources.</p>
          <a href="#" style={{ 
            background: 'var(--gradient-sky)', color: '#fff', padding: '12px 24px', borderRadius: '14px', 
            fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(14, 165, 233, 0.2)'
          }}>
            Help Center <ExternalLink size={16} />
          </a>
        </div>

      </div>

      {/* Copyright Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 2rem' }}>
        <div className="container" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 500 }}>
            © {currentYear} <span style={{ color: '#fff', fontWeight: 700 }}>VEMU Institute of Technology & Sciences.</span> All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.2s ease' }}
                 onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                 onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
