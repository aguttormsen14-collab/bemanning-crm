import { useReducer, useState } from 'react';
import './index.css';
import { initialData } from './data';
import { useStorage } from './useStorage';
import Dashboard from './components/Dashboard';
import Kunder from './components/Kunder';
import Vikarer from './components/Vikarer';
import Salg from './components/Salg';
import Vakter from './components/Vakter';

const VIEWS = [
  { id: 'dashboard', label: 'Oversikt' },
  { id: 'kunder', label: 'Kunder' },
  { id: 'vikarer', label: 'Vikarer' },
  { id: 'salg', label: 'Salg' },
  { id: 'vakter', label: 'Vakter' },
];

function crmReducer(state, action) {
  const { entity, item, id, type } = action;
  switch (type) {
    case 'ADD': {
      const newId = state.nextId[entity];
      return {
        ...state,
        [entity]: [...state[entity], { ...item, id: newId }],
        nextId: { ...state.nextId, [entity]: newId + 1 },
      };
    }
    case 'UPDATE':
      return { ...state, [entity]: state[entity].map(i => i.id === item.id ? item : i) };
    case 'DELETE':
      return { ...state, [entity]: state[entity].filter(i => i.id !== id) };
    default:
      return state;
  }
}

export default function App() {
  const [stored, setStored] = useStorage('bemanning-crm-data', initialData);
  const [data, dispatch] = useReducer(crmReducer, stored);
  const [view, setView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync to localStorage on every dispatch
  const wrappedDispatch = (action) => {
    const next = crmReducer(data, action);
    setStored(next);
    dispatch(action);
  };

  const navStyle = (id) => ({
    padding: '8px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    background: view === id ? 'rgba(255,255,255,0.18)' : 'transparent',
    color: '#fff',
    border: 'none',
    transition: 'background 0.15s',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <header style={{
        background: '#1F4E79', color: '#fff', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 16px',
          display: 'flex', alignItems: 'center', height: 54,
          justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>
            Bemanning CRM
          </span>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 4, '@media(max-width:640px)': { display: 'none' } }}
            className="desktop-nav">
            {VIEWS.map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={navStyle(v.id)}>
                {v.label}
              </button>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(m => !m)}
            style={{
              display: 'none', background: 'none', border: 'none', color: '#fff',
              fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4,
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="mobile-menu" style={{
            background: '#174068', borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 16px 12px',
          }}>
            {VIEWS.map(v => (
              <button key={v.id} onClick={() => { setView(v.id); setMenuOpen(false); }}
                style={{ ...navStyle(v.id), display: 'block', width: '100%', textAlign: 'left', marginBottom: 2 }}>
                {v.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Responsive nav styles */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>

      {/* Main content */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        {view === 'dashboard' && <Dashboard data={data} onNav={setView} />}
        {view === 'kunder' && <Kunder data={data} dispatch={wrappedDispatch} />}
        {view === 'vikarer' && <Vikarer data={data} dispatch={wrappedDispatch} />}
        {view === 'salg' && <Salg data={data} dispatch={wrappedDispatch} />}
        {view === 'vakter' && <Vakter data={data} dispatch={wrappedDispatch} />}
      </main>
    </div>
  );
}
