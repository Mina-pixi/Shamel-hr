'use client';
import { useEffect, useState } from 'react';
import { pointsDB, crmAnon } from '@/lib/supabase';

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [stats, setStats] = useState({ employees: 0, active: 0, totalPayroll: 0, pendingSlips: 0 });
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthName = now.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    // Get employees
    const { data: employees } = await pointsDB.from('hr_employees').select('*').eq('is_active', true);
    const emp = employees || [];

    // Get performance from CRM
    const { data: perf } = await crmAnon.rpc('get_telesales_leaderboard', { p_year: year, p_month: month });
    const perfData = perf || [];

    // Calculate total payroll
    let totalPayroll = 0;
    for (const e of emp) {
      const p = perfData.find((p: any) => p.email === e.email);
      const subs = p ? Number(p.subscription_count) : 0;
      totalPayroll += Number(e.base_salary) + subs * Number(e.bonus_per_sub);
    }

    setStats({
      employees: emp.length,
      active: perfData.filter((p: any) => Number(p.monthly_points) > 0).length,
      totalPayroll,
      pendingSlips: emp.length,
    });

    // Top 5 performers
    const top = perfData
      .filter((p: any) => Number(p.subscription_count) > 0)
      .slice(0, 5)
      .map((p: any) => {
        const e = emp.find((e: any) => e.email === p.email);
        return {
          ...p,
          bonus: Number(p.subscription_count) * (e ? Number(e.bonus_per_sub) : 50),
        };
      });
    setTopPerformers(top);
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Employees', value: stats.employees, color: '#58a6ff', icon: '👥' },
    { label: `Payroll ${monthName}`, value: `EGP ${stats.totalPayroll.toLocaleString()}`, color: '#3fb950', icon: '💰' },
    { label: 'Active This Month', value: stats.active, color: '#a371f7', icon: '⚡' },
    { label: 'Pending Pay Slips', value: stats.pendingSlips, color: '#f0883e', icon: '📄' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>HR Dashboard</h1>
          <div style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '2px' }}>{monthName} {year} — Shamel Telesales</div>
        </div>
        <button onClick={() => onNavigate('employees')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #3fb950, #2ea043)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>
          + Add Employee
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ color: '#8b949e', fontSize: '0.78rem', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: s.color }}>{loading ? '...' : s.value}</div>
          </div>
        ))}
      </div>

      {/* Top Performers */}
      <div className="glass-panel" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '600' }}>🏆 Top Performers — {monthName}</div>
          <button onClick={() => onNavigate('payslips')} style={{ fontSize: '0.75rem', color: '#58a6ff', background: 'none', border: '1px solid #30363d', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}>Generate Pay Slips</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['#', 'Employee', 'Team', 'Subs', 'Calls', 'Bonus'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: '#8b949e', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #21262d' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>Loading...</td></tr>
            ) : topPerformers.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #161b22' }}>
                <td style={{ padding: '12px 16px', fontWeight: '700', color: ['#FFD700','#C0C0C0','#CD7F32','#8b949e','#8b949e'][i] }}>
                  {['🥇','🥈','🥉','4','5'][i]}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: '600' }}>{p.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }}>
                    {p.email?.split('_')[0]}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#3fb950', fontWeight: '700' }}>{Number(p.subscription_count)}</td>
                <td style={{ padding: '12px 16px', color: '#58a6ff' }}>{Number(p.answered_calls)}</td>
                <td style={{ padding: '12px 16px', color: '#FFD700', fontWeight: '700' }}>EGP {p.bonus?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
