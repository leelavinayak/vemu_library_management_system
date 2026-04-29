import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, ShieldCheck, Star, BookMarked, Zap } from 'lucide-react';

const Landing = () => {
  return (
    <div>
      {/* NAVBAR */}
      <nav style={{ background: 'var(--accent)', padding: '0 2rem', height: '68px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem' }}>
            <img src="/vemu_logo_1.png" alt="VEMU Logo" style={{ height: '38px', width: 'auto', borderRadius: '4px' }} />
            <span>VEMU Library</span>
          </div>
          <Link to="/login">
            <button style={{ background: 'var(--primary)', padding: '10px 26px', fontWeight: 700, fontSize: '0.9rem', borderRadius: '99px' }}>
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div style={{ marginBottom: '2rem' }}>
            <img src="/vemu_logo_1.png" alt="VEMU Logo" style={{ height: '80px', width: 'auto', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: '99px', padding: '8px 22px', marginBottom: '1.5rem', color: 'var(--primary-dark)', fontSize: '0.9rem', fontWeight: 700 }}>
            <Zap size={15} /> VEMU Institute of Technology
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.04em', color: '#000' }}>
            VEMU Library <span style={{ color: 'var(--primary)', whiteSpace: 'nowrap' }}>Management System</span>
          </h1>
          <p>A professional digital platform for managing books, users, fines, and notifications. Experience seamless library administration today.</p>
          <div className="hero-buttons">
            <Link to="/login"><button className="btn-primary">Get Started →</button></Link>
          </div>
          <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['4', 'Portals'], ['∞', 'Books'], ['Instant', 'Alerts']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Poppins, sans-serif' }}>{num}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)' }}>Everything your library needs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>Four dedicated portals. One seamless system.</p>
          </div>
          <div className="grid">
            {[
              { icon: <Users size={28} color="var(--primary)" />, title: 'Multi-Portal Access', desc: 'Dedicated dashboards for Students, Teachers, Administrators, and Librarians with role-based permissions.' },
              { icon: <Clock size={28} color="var(--primary)" />, title: 'Real-time Tracking', desc: 'Monitor issued books, return dates, and automatically calculate fines — updated live.' },
              { icon: <ShieldCheck size={28} color="var(--primary)" />, title: 'Secure Management', desc: 'Advanced role-based access control ensures data privacy and system integrity.' },
              { icon: <BookMarked size={28} color="var(--primary)" />, title: 'Smart Notifications', desc: 'Get notified when unavailable books are returned and ready to borrow.' },
              { icon: <Star size={28} color="var(--primary)" />, title: 'Fine Management', desc: 'Automated ₹1/day overdue fines for students with complete transparency.' },
              { icon: <Zap size={28} color="var(--primary)" />, title: 'Instant Booking', desc: 'Reserve books in one click with availability status shown clearly in real-time.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
