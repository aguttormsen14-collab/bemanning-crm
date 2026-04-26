import { useEffect, useRef } from 'react';
import { avatarColor, initials, STATUS_BADGE } from '../data';

const s = {
  flex: (gap = 8, align = 'center', justify = 'flex-start') => ({
    display: 'flex', gap, alignItems: align, justifyContent: justify
  }),
  card: {
    background: '#fff', border: '0.5px solid #e4e4ec', borderRadius: 12,
    padding: '16px 18px', marginBottom: 10,
  },
  label: {
    display: 'block', fontSize: 11, fontWeight: 600, color: '#888',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  input: {
    width: '100%', padding: '8px 10px', border: '1px solid #dde', borderRadius: 8,
    background: '#fafbfc', outline: 'none', color: '#1a1a2e',
  },
  btn: {
    padding: '7px 16px', border: '1px solid #dde', borderRadius: 8,
    background: 'transparent', fontWeight: 500, transition: 'background 0.15s',
    cursor: 'pointer',
  },
};

export function Avatar({ name, size = 38 }) {
  const c = avatarColor(name || '?');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: c.bg, color: c.text,
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      userSelect: 'none',
    }}>
      {initials(name || '?')}
    </span>
  );
}

export function Badge({ status }) {
  const c = STATUS_BADGE[status] || { bg: '#F1EFE8', text: '#5F5E5A' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      background: c.bg, color: c.text, fontSize: 12, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

export function Card({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        ...s.card, ...style,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {children}
    </div>
  );
}

export function Btn({ children, onClick, variant = 'default', style, type = 'button' }) {
  const variantStyles = {
    default: { borderColor: '#dde', color: '#444' },
    primary: { borderColor: '#1F4E79', background: '#1F4E79', color: '#fff' },
    danger: { borderColor: '#c44', color: '#c44' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...s.btn, ...variantStyles[variant], ...style }}
      onMouseEnter={e => {
        if (variant === 'default') e.currentTarget.style.background = '#f0f2f5';
        if (variant === 'danger') e.currentTarget.style.background = '#fff0f0';
      }}
      onMouseLeave={e => {
        if (variant === 'primary') e.currentTarget.style.background = '#1F4E79';
        else e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={s.label}>{label}</label>}
      <input style={s.input} {...props} />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={s.label}>{label}</label>}
      <select style={{ ...s.input, cursor: 'pointer' }} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={s.label}>{label}</label>}
      <textarea style={{ ...s.input, minHeight: 70, resize: 'vertical', lineHeight: 1.5 }} {...props} />
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, padding: '22px 24px',
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: 20,
              cursor: 'pointer', color: '#888', lineHeight: 1, padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function MetaRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '7px 0', borderBottom: '1px solid #f0f0f5',
    }}>
      <span style={{ color: '#888', fontSize: 13, minWidth: 120 }}>{label}</span>
      <span style={{ textAlign: 'right', fontWeight: 500, fontSize: 13, wordBreak: 'break-word', maxWidth: '60%' }}>{value || '—'}</span>
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase',
      letterSpacing: '0.08em', marginBottom: 8, marginTop: 4,
    }}>
      {children}
    </div>
  );
}

export function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '14px 0' }} />;
}
