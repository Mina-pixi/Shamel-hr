'use client';
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Payroll from './components/Payroll';
import PaySlips from './components/PaySlips';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'Main' },
  { id: 'employees', label: 'Employees', icon: '👥', section: 'Main' },
  { id: 'payroll', label: 'Monthly Payroll', icon: '💰', section: 'Payroll' },
  { id: 'payslips', label: 'Pay Slips', icon: '📄', section: 'Payroll' },
];

const HR_PASSWORD = 'shamelhr2026';

export default function Home() {
  const [page, setPage] = useState('dashboard');
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  if (!auth) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a' }}>
      <div className="glass-panel" style={{ padding: '48px', width: '380px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏢</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #58a6ff, #a371f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>
          SHAMEL HR
        </div>
        <div style={{ color: '#8b949e', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '32px' }}>HUMAN RESOURCES SYSTEM</div>
        <input type="password" placeholder="Enter HR Password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { if (pw === HR_PASSWORD) { setAuth(true); setErr(''); } else setErr('Wrong password'); }}}
          style={{ marginBottom: '12px', padding: '12px 16px', fontSize: '1rem' }}
        />
        {err && <div style={{ color: '#f85149', fontSize: '0.85rem', marginBottom: '12px' }}>{err}</div>}
        <button onClick={() => { if (pw === HR_PASSWORD) { setAuth(true); setErr(''); } else setErr('Wrong password'); }}
          style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #58a6ff, #1f6feb)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
          Login
        </button>
      </div>
    </div>
  );

  const sections = [...new Set(NAV.map(n => n.section))];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0d1117', borderRight: '1px solid #21262d', position: 'fixed', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #21262d' }}>
          <div style={{ fontWeight: '800', fontSize: '1rem', background: 'linear-gradient(135deg, #58a6ff, #a371f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '1px' }}>SHAMEL HR</div>
          <div style={{ fontSize: '0.65rem', color: '#8b949e', letterSpacing: '2px', marginTop: '2px' }}>COMMAND CENTER</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {sections.map(section => (
            <div key={section}>
              <div style={{ padding: '12px 20px 4px', fontSize: '0.62rem', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' }}>{section}</div>
              {NAV.filter(n => n.section === section).map(n => (
                <div key={n.id} onClick={() => setPage(n.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 20px', cursor: 'pointer', fontSize: '0.875rem',
                  color: page === n.id ? '#58a6ff' : '#8b949e',
                  borderLeft: `3px solid ${page === n.id ? '#58a6ff' : 'transparent'}`,
                  background: page === n.id ? 'rgba(88,166,255,0.08)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <span>{n.icon}</span>
                  <span>{n.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #21262d' }}>
          <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>Logged in as</div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', marginTop: '2px' }}>HR Manager</div>
          <button onClick={() => setAuth(false)} style={{ marginTop: '8px', fontSize: '0.75rem', color: '#f85149', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Logout</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginLeft: '220px', flex: 1, padding: '24px' }}>
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'employees' && <Employees />}
        {page === 'payroll' && <Payroll />}
        {page === 'payslips' && <PaySlips />}
      </div>
    </div>
  );
}
