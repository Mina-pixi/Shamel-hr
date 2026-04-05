'use client';
import { useEffect, useState } from 'react';
import { pointsDB, crmAnon } from '@/lib/supabase';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Payroll({ dark, t }: { dark?: boolean, t?: any }) {
  const theme = t || { panel: '#161b22', panelBorder: '#21262d', text: '#e6edf3', subtext: '#8b949e', inputBg: '#0d1117', inputBorder: '#30363d', tableBorder: '#161b22' };
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, [month, year]);

  const load = async () => {
    setLoading(true);
    const { data: employees } = await pointsDB.from('hr_employees').select('*').eq('is_active', true);
    const { data: perf } = await crmAnon.rpc('get_telesales_leaderboard', { p_year: year, p_month: month + 1 });
    const emp = employees || [];
    const perfData = perf || [];

    const rows = emp.map((e: any) => {
      const p = perfData.find((p: any) => p.email === e.email);
      const subs = p ? Number(p.subscription_count) : 0;
      const calls = p ? Number(p.answered_calls) : 0;
      const target = Number(e.monthly_target) || 60;
      const kpiAmount = Number(e.kpi_amount) || 0;
      const achievement = subs / target;
      // Min 80% to qualify, then progressive
      const kpiEarned = achievement >= 0.8 ? Math.min(achievement, 1) * kpiAmount : 0;
      const net = Number(e.base_salary) + kpiEarned;
      return {
        ...e,
        subscription_count: subs,
        answered_calls: calls,
        bonus: kpiEarned,
        achievement: Math.round(achievement * 100),
        net_salary: net,
        monthly_points: p ? Number(p.monthly_points) : 0,
      };
    }).sort((a: any, b: any) => b.net_salary - a.net_salary);

    setPayroll(rows);
    setLoading(false);
  };

  const generateAll = async () => {
    setGenerating(true);
    setMsg('Generating payroll...');
    let count = 0;
    for (const e of payroll) {
      const { error } = await pointsDB.from('hr_payroll').upsert({
        employee_id: e.id,
        year, month: month + 1,
        base_salary: e.base_salary,
        bonus: e.bonus,
        deductions: 0,
        net_salary: e.net_salary,
        subscription_count: e.subscription_count,
        answered_calls: e.answered_calls,
      }, { onConflict: 'employee_id,year,month' });
      if (!error) count++;
    }
    setMsg(`✅ Generated ${count} pay records!`);
    setGenerating(false);
  };

  const totalBase = payroll.reduce((s, e) => s + Number(e.base_salary), 0);
  const totalBonus = payroll.reduce((s, e) => s + Number(e.bonus), 0);
  const totalNet = payroll.reduce((s, e) => s + Number(e.net_salary), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFD700"/><stop offset="100%" stopColor="#FFA500"/></linearGradient></defs>
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="url(#pg)" strokeWidth="2"/>
            <path d="M2 10h20" stroke="url(#pg)" strokeWidth="2"/>
            <circle cx="12" cy="15" r="2" stroke="url(#pg)" strokeWidth="2"/>
          </svg>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Monthly Payroll</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ width: '140px', background: '#161b22', border: '1px solid #30363d', color: '#e6edf3', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: '100px', background: '#161b22', border: '1px solid #30363d', color: '#e6edf3', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
            {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={generateAll} disabled={generating} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #3fb950, #2ea043)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {generating ? 'Generating...' : '⚡ Generate Payroll'}
          </button>
        </div>
      </div>

      {msg && <div style={{ padding: '12px 16px', background: msg.includes('✅') ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', border: `1px solid ${msg.includes('✅') ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem', color: msg.includes('✅') ? '#3fb950' : '#f85149' }}>{msg}</div>}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Base Salary', value: `EGP ${totalBase.toLocaleString()}`, color: '#58a6ff' },
          { label: 'Total Bonuses', value: `EGP ${totalBonus.toLocaleString()}`, color: '#FFD700' },
          { label: 'Total Net Payroll', value: `EGP ${totalNet.toLocaleString()}`, color: '#3fb950' },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
            <div style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{loading ? '...' : s.value}</div>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div className="glass-panel">
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #21262d' }}>
          <div style={{ fontWeight: '600' }}>{MONTHS[month]} {year} — Payroll Details ({payroll.length} employees)</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Employee', 'Team', 'Base Salary', 'Subs / Target', 'Achievement', 'KPI Earned', 'Net Salary'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: '#8b949e', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #21262d' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>Loading...</td></tr>
            ) : payroll.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: '1px solid #161b22', opacity: e.subscription_count === 0 ? 0.5 : 1 }}>
                <td style={{ padding: '12px 16px', fontWeight: '600' }}>{e.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '0.72rem', background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }}>{e.team_name || '—'}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#e6edf3' }}>EGP {Number(e.base_salary).toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: '#3fb950', fontWeight: '600' }}>{e.subscription_count}</span>
                  <span style={{ color: '#8b949e', fontSize: '0.78rem' }}> / {e.monthly_target || 60}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '600',
                    background: e.achievement >= 100 ? 'rgba(255,215,0,0.15)' : e.achievement >= 80 ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)',
                    color: e.achievement >= 100 ? '#FFD700' : e.achievement >= 80 ? '#3fb950' : '#f85149',
                  }}>{e.achievement}%</span>
                </td>
                <td style={{ padding: '12px 16px', color: e.bonus > 0 ? '#FFD700' : '#8b949e', fontWeight: '600' }}>
                  {e.bonus > 0 ? `+ EGP ${Number(e.bonus).toLocaleString()}` : e.kpi_amount > 0 ? '—' : 'No KPI'}
                </td>
                <td style={{ padding: '12px 16px', color: '#3fb950', fontWeight: '800', fontSize: '1rem' }}>EGP {Number(e.net_salary).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
