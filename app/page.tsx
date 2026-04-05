'use client';
import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Payroll from './components/Payroll';
import PaySlips from './components/PaySlips';

const HR_PASSWORD = 'shamelhr2026';

// Vector Icons
const Icons = {
  dashboard: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
    </svg>
  ),
  employees: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  payroll: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2"/>
      <path d="M2 10h20" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="15" r="2" stroke={color} strokeWidth="2"/>
    </svg>
  ),
  payslips: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="17" x2="12" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  analytics: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  attendance: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2"/>
      <path d="M8 14l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  settings: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  users: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  logout: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="16,17 21,12 16,7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  sun: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2"/>
      <line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  moon: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', section: 'Main' },
  { id: 'employees', label: 'Employees', icon: 'employees', section: 'Main' },
  { id: 'payroll', label: 'Monthly Payroll', icon: 'payroll', section: 'Payroll' },
  { id: 'payslips', label: 'Pay Slips', icon: 'payslips', section: 'Payroll' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics', section: 'Reports' },
  { id: 'attendance', label: 'Attendance', icon: 'attendance', section: 'Reports' },
  { id: 'settings', label: 'Salary Rules', icon: 'settings', section: 'Settings' },
  { id: 'hrusers', label: 'HR Users', icon: 'users', section: 'Settings' },
];

export default function Home() {
  const [page, setPage] = useState('dashboard');
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [dark, setDark] = useState(true);

  const t = {
    bg: dark ? '#0a0e1a' : '#f0f2f5',
    sidebar: dark ? '#0d1117' : '#ffffff',
    sidebarBorder: dark ? '#21262d' : '#e2e8f0',
    panel: dark ? '#161b22' : '#ffffff',
    panelBorder: dark ? '#21262d' : '#e2e8f0',
    text: dark ? '#e6edf3' : '#1a202c',
    subtext: dark ? '#8b949e' : '#718096',
    sectionLabel: dark ? '#444' : '#a0aec0',
    activeNavBg: dark ? 'rgba(88,166,255,0.08)' : 'rgba(88,166,255,0.1)',
    inputBg: dark ? '#0d1117' : '#f7fafc',
    inputBorder: dark ? '#30363d' : '#e2e8f0',
    hover: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    tableBorder: dark ? '#161b22' : '#f0f2f5',
  };

  if (!auth) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg, transition: 'all 0.3s' }}>
      <div style={{ background: t.panel, border: `1px solid ${t.panelBorder}`, borderRadius: '16px', padding: '48px', width: '380px', textAlign: 'center', boxShadow: dark ? '0 0 40px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.1)' }}>
        {/* Theme toggle on login */}
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <button onClick={() => setDark(!dark)} style={{ background: 'none', border: `1px solid ${t.panelBorder}`, borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
            {dark ? Icons.sun('#FFD700') : Icons.moon('#6e40c9')}
          </button>
        </div>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #58a6ff, #a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(88,166,255,0.3)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #58a6ff, #a371f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>SHAMEL HR</div>
        <div style={{ color: t.subtext, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '32px' }}>HUMAN RESOURCES SYSTEM</div>
        <input type="password" placeholder="Enter HR Password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { if (pw === HR_PASSWORD) { setAuth(true); setErr(''); } else setErr('Wrong password'); }}}
          style={{ marginBottom: '12px', padding: '12px 16px', fontSize: '1rem', background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: '8px', color: t.text, width: '100%' }}
        />
        {err && <div style={{ color: '#f85149', fontSize: '0.85rem', marginBottom: '12px' }}>{err}</div>}
        <button onClick={() => { if (pw === HR_PASSWORD) { setAuth(true); setErr(''); } else setErr('Wrong password'); }}
          style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #58a6ff, #1f6feb)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(88,166,255,0.3)' }}>
          Login
        </button>
      </div>
    </div>
  );

  const sections = [...new Set(NAV.map(n => n.section))];
  const activeColor = '#58a6ff';
  const inactiveColor = t.subtext;

  const comingSoon = ['analytics', 'attendance', 'settings', 'hrusers'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, transition: 'all 0.3s', color: t.text }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: t.sidebar, borderRight: `1px solid ${t.sidebarBorder}`, position: 'fixed', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 100, transition: 'all 0.3s' }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${t.sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #58a6ff, #a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(88,166,255,0.3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', background: 'linear-gradient(135deg, #58a6ff, #a371f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '1px' }}>SHAMEL HR</div>
              <div style={{ fontSize: '0.6rem', color: t.sectionLabel, letterSpacing: '2px' }}>COMMAND CENTER</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {sections.map(section => (
            <div key={section}>
              <div style={{ padding: '12px 20px 4px', fontSize: '0.62rem', color: t.sectionLabel, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600' }}>{section}</div>
              {NAV.filter(n => n.section === section).map(n => {
                const isActive = page === n.id;
                const iconColor = isActive ? activeColor : inactiveColor;
                return (
                  <div key={n.id} onClick={() => setPage(n.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 20px', cursor: 'pointer', fontSize: '0.875rem',
                    color: isActive ? activeColor : t.subtext,
                    borderLeft: `3px solid ${isActive ? activeColor : 'transparent'}`,
                    background: isActive ? t.activeNavBg : 'transparent',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}>
                    {(Icons as any)[n.icon]?.(iconColor)}
                    <span style={{ fontWeight: isActive ? '600' : '400' }}>{n.label}</span>
                    {comingSoon.includes(n.id) && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.6rem', background: 'rgba(163,113,247,0.15)', color: '#a371f7', padding: '2px 6px', borderRadius: '99px', border: '1px solid rgba(163,113,247,0.3)' }}>Soon</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.sidebarBorder}` }}>
          {/* Theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: t.subtext }}>{dark ? 'Dark Mode' : 'Light Mode'}</span>
            <button onClick={() => setDark(!dark)} style={{
              width: '44px', height: '24px', borderRadius: '99px',
              background: dark ? '#58a6ff' : '#e2e8f0',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
            }}>
              <div style={{
                position: 'absolute', top: '2px',
                left: dark ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'white', transition: 'all 0.3s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: t.subtext }}>Logged in as</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: t.text, marginTop: '1px' }}>HR Manager</div>
            </div>
            <button onClick={() => setAuth(false)} style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons.logout('#f85149')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginLeft: '240px', flex: 1, padding: '24px', transition: 'all 0.3s' }}>
        {comingSoon.includes(page) ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '4rem' }}>🚧</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: t.text }}>Coming Soon</div>
            <div style={{ color: t.subtext }}>This feature is under development</div>
            <button onClick={() => setPage('dashboard')} style={{ marginTop: '8px', padding: '10px 24px', background: 'linear-gradient(135deg, #58a6ff, #1f6feb)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Back to Dashboard</button>
          </div>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard onNavigate={setPage} dark={dark} t={t} />}
            {page === 'employees' && <Employees dark={dark} t={t} />}
            {page === 'payroll' && <Payroll dark={dark} t={t} />}
            {page === 'payslips' && <PaySlips dark={dark} t={t} />}
          </>
        )}
      </div>
    </div>
  );
}
