import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.3s ease-out'
      }}>
        {/* Header decoration based on type */}
        <div style={{
          height: '6px',
          backgroundColor: type === 'danger' ? '#ef4444' : '#3b82f6'
        }} />

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: type === 'danger' ? '#fef2f2' : '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: type === 'danger' ? '#ef4444' : '#3b82f6',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={24} />
            </div>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: '#94a3b8'
            }}>
              <X size={20} />
            </button>
          </div>

          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: 700 }}>{title}</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>{message}</p>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={onClose} 
              className="ghost" 
              style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }}
            >
              Cancel
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }} 
              className={type === 'danger' ? 'danger' : ''}
              style={{ 
                flex: 1, 
                padding: '12px', 
                fontSize: '0.9rem',
                backgroundColor: type === 'danger' ? '#ef4444' : '#3b82f6'
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
