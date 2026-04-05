'use client';
import { useEffect, useState } from 'react';
import { pointsDB, crmAnon } from '@/lib/supabase';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Q1 2026 Telesales-Only: Revenue=TM subs revenue, Spend=Agent salaries
const Q1_DATA: Record<number,any> = {
  1: { tmSubs: 700, revenue: 434000, spend: 391000, roi: 1.11, cac: 559, abandoned: 1168, familySubs: 384, individualSubs: 316 },
  2: { tmSubs: 806, revenue: 492000, spend: 501000, roi: 0.98, cac: 622, abandoned: 1364, familySubs: 423, individualSubs: 383 },
  3: { tmSubs: 421, revenue: 247000, spend: 430000, roi: 0.57, cac: 1021, abandoned: 1636, familySubs: 196, individualSubs: 225 },
};

const TEAM_NAMES: Record<string, string> = {
  'Team 1': "Mariam's Squad", 'Team 2': "Youssef's Squad",
  'Team 3': "Ruqaia's Squad", 'Team 4': "Jolie's Squad",
  'Team 5': "Mariam A's Squad", 'Team 6': "Nourhan's Squad",
  'Team I Career': "Peter's Squad", 'Team On Ground': 'OG Strikers',
  'Team Seniors leader': 'The Seniors',
};

export default function Analytics({ dark, t }: { dark?: boolean, t?: any }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState({ achieved: 0, partial: 0, missed: 0, total: 0 });
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [topEarners, setTopEarners] = useState<any[]>([]);
  const [teamPayroll, setTeamPayroll] = useState<any[]>([]);
  const [currentFinancials, setCurrentFinancials] = useState({ totalBase: 0, totalKpi: 0, totalNet: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentMonth = now.getMonth() + 1;

  useEffect(() => { load(); }, [year]);

  const load = async () => {
    setLoading(true);
    const monthPromises = Array.from({ length: currentMonth }, (_, i) =>
      crmAnon.rpc('get_telesales_leaderboard', { p_year: year, p_month: i + 1 })
    );
    const results = await Promise.all(monthPromises);
    const monthly = results.map((r, i) => {
      const data = r.data || [];
      return {
        month: MONTHS[i],
        subs: data.reduce((s: number, a: any) => s + Number(a.subscription_count), 0),
        calls: data.reduce((s: number, a: any) => s + Number(a.answered_calls), 0),
        agents: data.filter((a: any) => Number(a.monthly_points) > 0).length,
      };
    });
    setMonthlyData(monthly);
    const currentData = results[currentMonth - 1]?.data || [];
    const top = [...currentData].sort((a: any, b: any) => Number(b.subscription_count) - Number(a.subscription_count)).slice(0, 8);
    setTopAgents(top);
    const { data: teams } = await crmAnon.rpc('get_team_leaderboard', { p_year: year, p_month: currentMonth });
    setTeamData((teams || []).filter((t: any) => Number(t.total_subs) > 0));
    const { data: employees } = await pointsDB.from('hr_employees').select('*').eq('is_active', true);
    const emp = employees || [];
    let achieved = 0, partial = 0, missed = 0;
    for (const e of emp) {
      if (Number(e.kpi_amount) === 0) continue;
      const perf = currentData.find((p: any) => p.email === e.email);
      const subs = perf ? Number(perf.subscription_count) : 0;
      const pct = subs / 60;
      if (pct >= 1) achieved++;
      else if (pct >= 0.8) partial++;
      else missed++;
    }
    setKpiData({ achieved, partial, missed, total: achieved + partial + missed });

    // Financial calculations per month
    const finMonthly = results.map((r, i) => {
      const data = r.data || [];
      let totalBase = 0, totalKpi = 0;
      for (const e of emp) {
        totalBase += Number(e.base_salary);
        const perf = data.find((p: any) => p.email === e.email);
        const subs = perf ? Number(perf.subscription_count) : 0;
        const achievement = subs / 60;
        const kpiEarned = achievement >= 0.8 ? Math.min(achievement, 1) * Number(e.kpi_amount) : 0;
        totalKpi += kpiEarned;
      }
      return { month: MONTHS[i], totalBase, totalKpi, totalNet: totalBase + totalKpi };
    });
    setFinancialData(finMonthly);

    // Current month financials
    const curFin = finMonthly[currentMonth - 1] || { totalBase: 0, totalKpi: 0, totalNet: 0 };
    setCurrentFinancials(curFin);

    // Top earners current month
    const earners = emp.map((e: any) => {
      const perf = currentData.find((p: any) => p.email === e.email);
      const subs = perf ? Number(perf.subscription_count) : 0;
      const achievement = subs / 60;
      const kpiEarned = achievement >= 0.8 ? Math.min(achievement, 1) * Number(e.kpi_amount) : 0;
      return { name: e.name, team: e.team_name, base: Number(e.base_salary), kpi: kpiEarned, net: Number(e.base_salary) + kpiEarned, subs };
    }).sort((a: any, b: any) => b.net - a.net).slice(0, 8);
    setTopEarners(earners);

    // Team payroll
    const teamPay: Record<string, any> = {};
    for (const e of emp) {
      const team = e.team_name || 'Unassigned';
      if (!teamPay[team]) teamPay[team] = { team, base: 0, kpi: 0, net: 0, agents: 0 };
      const perf = currentData.find((p: any) => p.email === e.email);
      const subs = perf ? Number(perf.subscription_count) : 0;
      const achievement = subs / 60;
      const kpiEarned = achievement >= 0.8 ? Math.min(achievement, 1) * Number(e.kpi_amount) : 0;
      teamPay[team].base += Number(e.base_salary);
      teamPay[team].kpi += kpiEarned;
      teamPay[team].net += Number(e.base_salary) + kpiEarned;
      teamPay[team].agents++;
    }
    setTeamPayroll(Object.values(teamPay).sort((a: any, b: any) => b.net - a.net).filter((t: any) => t.net > 0));

    // Revenue data per month using Q1 static + live calculation
    const revData = Array.from({ length: currentMonth }, (_, i) => {
      const m = i + 1;
      const q1 = Q1_DATA[m];
      const liveMonth = results[i]?.data || [];
      const liveSubs = liveMonth.reduce((s: number, a: any) => s + Number(a.subscription_count), 0);
      const totalSalaries = emp.reduce((s: number, e: any) => s + Number(e.base_salary), 0);
      if (q1) {
        return { month: MONTHS[i], revenue: q1.revenue, spend: q1.spend, roi: q1.roi, cac: q1.cac, subs: q1.tmSubs, abandoned: q1.abandoned, familySubs: q1.familySubs, individualSubs: q1.individualSubs };
      }
      return { month: MONTHS[i], revenue: 0, spend: totalSalaries, roi: 0, cac: liveSubs > 0 ? Math.round(totalSalaries/liveSubs) : 0, subs: liveSubs, abandoned: 0, familySubs: 0, individualSubs: 0 };
    });
    setRevenueData(revData);

    setLoading(false);
  };

  const maxSubs = Math.max(...monthlyData.map(m => m.subs), 1);
  const maxAgentSubs = Math.max(...topAgents.map(a => Number(a.subscription_count)), 1);
  const maxTeamSubs = Math.max(...teamData.map(t => Number(t.total_subs)), 1);
  const bg = dark ? '#161b22' : '#ffffff';
  const border = dark ? '#21262d' : '#e2e8f0';
  const subtext = dark ? '#8b949e' : '#718096';
  const text = dark ? '#e6edf3' : '#1a202c';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs><linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a371f7"/><stop offset="100%" stopColor="#58a6ff"/></linearGradient></defs>
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="url(#ag)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: text }}>Analytics</h1>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: bg, border: `1px solid ${border}`, color: text, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
          {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total with KPI', value: kpiData.total, color: '#58a6ff' },
          { label: '🎯 Target Achieved', value: kpiData.achieved, color: '#FFD700', sub: kpiData.total ? `${Math.round(kpiData.achieved/kpiData.total*100)}%` : '0%' },
          { label: '📈 Partial (80-99%)', value: kpiData.partial, color: '#3fb950', sub: kpiData.total ? `${Math.round(kpiData.partial/kpiData.total*100)}%` : '0%' },
          { label: '❌ Missed (<80%)', value: kpiData.missed, color: '#f85149', sub: kpiData.total ? `${Math.round(kpiData.missed/kpiData.total*100)}%` : '0%' },
        ].map((s, i) => (
          <div key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ color: subtext, fontSize: '0.78rem', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: s.color }}>{loading ? '...' : s.value}</div>
            {s.sub && <div style={{ color: subtext, fontSize: '0.75rem', marginTop: '4px' }}>{s.sub} of team</div>}
          </div>
        ))}
      </div>

      {/* Q1 Summary Cards */}
      {year === 2026 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Q1 TM Revenue', value: 'EGP 1.17M', sub: 'Telesales only', color: '#3fb950' },
            { label: 'Q1 Salary Spend', value: 'EGP 1.32M', sub: 'Agent salaries', color: '#f85149' },
            { label: 'Best TM ROI', value: '1.11x', sub: 'January', color: '#FFD700' },
            { label: 'Best CAC', value: 'EGP 559', sub: 'January', color: '#58a6ff' },
            { label: 'Q1 Abandoned', value: '4,168', sub: 'Rising monthly', color: '#a371f7' },
          ].map((s, i) => (
            <div key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px', borderTop: `3px solid ${s.color}` }}>
              <div style={{ color: subtext, fontSize: '0.72rem', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ color: subtext, fontSize: '0.7rem', marginTop: '4px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue vs Salary Spend Chart */}
      {revenueData.some(m => m.revenue > 0) && (
        <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontWeight: '600', color: text, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💹 TM Revenue vs Salary Spend</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#3fb950' }} /><span style={{ fontSize: '0.75rem', color: subtext }}>TM Revenue</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#f85149' }} /><span style={{ fontSize: '0.75rem', color: subtext }}>Salary Spend</span></div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px', padding: '0 8px' }}>
            {revenueData.filter(m => m.revenue > 0 || m.spend > 0).map((m, i) => {
              const maxVal = Math.max(...revenueData.map(r => Math.max(r.revenue, r.spend)), 1);
              const revH = Math.max((m.revenue / maxVal) * 160, m.revenue > 0 ? 4 : 0);
              const spendH = Math.max((m.spend / maxVal) * 160, m.spend > 0 ? 4 : 0);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', display: 'flex', gap: '4px', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.6rem', color: '#3fb950', fontWeight: '600' }}>{m.revenue > 0 ? Math.round(m.revenue/1000)+'k' : ''}</span>
                      <div style={{ width: '100%', height: `${revH}px`, background: 'linear-gradient(180deg, #3fb950, #2ea043)', borderRadius: '4px 4px 0 0' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.6rem', color: '#f85149', fontWeight: '600' }}>{m.spend > 0 ? Math.round(m.spend/1000)+'k' : ''}</span>
                      <div style={{ width: '100%', height: `${spendH}px`, background: 'linear-gradient(180deg, #f85149, #da3633)', borderRadius: '4px 4px 0 0' }} />
                    </div>
                  </div>
                  <div style={{ color: subtext, fontSize: '0.72rem', fontWeight: '600' }}>{m.month}</div>
                  {m.roi > 0 && <div style={{ fontSize: '0.65rem', color: m.roi >= 1 ? '#3fb950' : '#f85149', fontWeight: '600' }}>ROI {m.roi}x</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Family vs Individual + CAC Cards */}
      {revenueData.some(m => m.familySubs > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Family vs Individual Chart */}
          <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontWeight: '600', color: text, marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>👨‍👩‍👧 Family vs 👤 Individual</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#58a6ff' }} /><span style={{ fontSize: '0.7rem', color: subtext }}>Family</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#a371f7' }} /><span style={{ fontSize: '0.7rem', color: subtext }}>Individual</span></div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '150px' }}>
              {revenueData.filter(m => m.familySubs > 0).map((m, i) => {
                const maxS = Math.max(...revenueData.map(r => r.familySubs + r.individualSubs), 1);
                const fH = Math.max((m.familySubs / maxS) * 120, 4);
                const iH = Math.max((m.individualSubs / maxS) * 120, 4);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ width: '100%', display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.58rem', color: '#58a6ff' }}>{m.familySubs}</span>
                        <div style={{ width: '100%', height: `${fH}px`, background: 'linear-gradient(180deg,#58a6ff,#1f6feb)', borderRadius: '4px 4px 0 0' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.58rem', color: '#a371f7' }}>{m.individualSubs}</span>
                        <div style={{ width: '100%', height: `${iH}px`, background: 'linear-gradient(180deg,#a371f7,#6e40c9)', borderRadius: '4px 4px 0 0' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: subtext }}>{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CAC per month */}
          <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontWeight: '600', color: text, marginBottom: '16px' }}>📊 CAC & Abandoned per Month</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {revenueData.filter(m => m.cac > 0).map((m, i) => (
                <div key={i} style={{ background: dark ? '#0d1117' : '#f7fafc', borderRadius: '8px', padding: '12px 16px', border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', color: text, fontSize: '0.9rem' }}>{['January','February','March'][i]}</span>
                    <span style={{ fontSize: '0.8rem', color: m.roi >= 1 ? '#3fb950' : '#f85149', fontWeight: '700' }}>ROI {m.roi}x</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div><div style={{ fontSize: '0.65rem', color: subtext }}>TM Subs</div><div style={{ fontWeight: '700', color: '#3fb950', fontSize: '0.9rem' }}>{m.subs}</div></div>
                    <div><div style={{ fontSize: '0.65rem', color: subtext }}>CAC/Sub</div><div style={{ fontWeight: '700', color: m.cac < 700 ? '#3fb950' : '#f85149', fontSize: '0.9rem' }}>EGP {m.cac}</div></div>
                    <div><div style={{ fontSize: '0.65rem', color: subtext }}>Abandoned</div><div style={{ fontWeight: '700', color: '#a371f7', fontSize: '0.9rem' }}>{m.abandoned.toLocaleString()}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Bar Chart */}
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontWeight: '600', color: text, marginBottom: '20px' }}>📊 Monthly Subscriptions — {year}</div>
        {loading ? <div style={{ textAlign: 'center', padding: '40px', color: subtext }}>Loading...</div> : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', padding: '0 8px' }}>
            {monthlyData.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ color: text, fontSize: '0.72rem', fontWeight: '600' }}>{m.subs}</div>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  height: `${Math.max((m.subs / maxSubs) * 160, 4)}px`,
                  background: i === currentMonth - 1 ? 'linear-gradient(180deg, #58a6ff, #1f6feb)' : dark ? 'rgba(88,166,255,0.25)' : 'rgba(88,166,255,0.15)',
                  transition: 'height 0.5s ease',
                  boxShadow: i === currentMonth - 1 ? '0 0 12px rgba(88,166,255,0.4)' : 'none',
                }} />
                <div style={{ color: subtext, fontSize: '0.65rem' }}>{m.month}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Top Agents */}
        <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontWeight: '600', color: text, marginBottom: '16px' }}>🏆 Top Agents — {FULL_MONTHS[currentMonth - 1]}</div>
          {loading ? <div style={{ textAlign: 'center', padding: '20px', color: subtext }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topAgents.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', textAlign: 'center', fontSize: '0.85rem', color: ['#FFD700','#C0C0C0','#CD7F32'][i] || subtext, fontWeight: '700', flexShrink: 0 }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: '600', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                      <span style={{ fontSize: '0.78rem', color: '#3fb950', fontWeight: '700', flexShrink: 0, marginLeft: '8px' }}>{Number(a.subscription_count)} subs</span>
                    </div>
                    <div style={{ background: dark ? '#21262d' : '#f0f2f5', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '99px', width: `${(Number(a.subscription_count) / maxAgentSubs) * 100}%`, background: i === 0 ? 'linear-gradient(90deg,#FFD700,#FFA500)' : i === 1 ? 'linear-gradient(90deg,#C0C0C0,#A0A0A0)' : i === 2 ? 'linear-gradient(90deg,#CD7F32,#A0522D)' : 'linear-gradient(90deg,#58a6ff,#1f6feb)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Performance */}
        <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontWeight: '600', color: text, marginBottom: '16px' }}>⚔️ Team Performance — {FULL_MONTHS[currentMonth - 1]}</div>
          {loading ? <div style={{ textAlign: 'center', padding: '20px', color: subtext }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teamData.map((team, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '700', color: subtext, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: '600', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{TEAM_NAMES[team.team_name] || team.team_name}</span>
                      <span style={{ fontSize: '0.78rem', color: '#a371f7', fontWeight: '700', flexShrink: 0, marginLeft: '8px' }}>{Number(team.total_subs)} subs</span>
                    </div>
                    <div style={{ background: dark ? '#21262d' : '#f0f2f5', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '99px', width: `${(Number(team.total_subs) / maxTeamSubs) * 100}%`, background: 'linear-gradient(90deg,#a371f7,#6e40c9)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: subtext, flexShrink: 0 }}>{Number(team.active_agents)} agents</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Total Base Salaries', value: `EGP ${currentFinancials.totalBase.toLocaleString()}`, color: '#58a6ff', sub: 'Fixed monthly cost' },
          { label: 'Total KPI Bonuses', value: `EGP ${Math.round(currentFinancials.totalKpi).toLocaleString()}`, color: '#FFD700', sub: 'Performance based' },
          { label: 'Total Net Payroll', value: `EGP ${Math.round(currentFinancials.totalNet).toLocaleString()}`, color: '#3fb950', sub: FULL_MONTHS[currentMonth - 1] + ' ' + year },
        ].map((s, i) => (
          <div key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ color: subtext, fontSize: '0.78rem', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{loading ? '...' : s.value}</div>
            <div style={{ color: subtext, fontSize: '0.75rem', marginTop: '4px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Payroll Trend Chart */}
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontWeight: '600', color: text, marginBottom: '20px' }}>💰 Payroll Trend — {year}</div>
        {loading ? <div style={{ textAlign: 'center', padding: '40px', color: subtext }}>Loading...</div> : (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', padding: '0 8px', marginBottom: '8px' }}>
              {financialData.map((m, i) => {
                const maxNet = Math.max(...financialData.map(f => f.totalNet), 1);
                const baseH = Math.max((m.totalBase / maxNet) * 150, 4);
                const kpiH = Math.max((m.totalKpi / maxNet) * 150, m.totalKpi > 0 ? 4 : 0);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.6rem', color: subtext }}>{m.totalNet > 0 ? `${Math.round(m.totalNet/1000)}k` : ''}</div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: `${kpiH}px`, background: 'linear-gradient(180deg, #FFD700, #FFA500)', opacity: i === currentMonth - 1 ? 1 : 0.5 }} />
                      <div style={{ width: '100%', height: `${baseH}px`, background: i === currentMonth - 1 ? 'linear-gradient(180deg, #58a6ff, #1f6feb)' : dark ? 'rgba(88,166,255,0.25)' : 'rgba(88,166,255,0.15)' }} />
                    </div>
                    <div style={{ color: subtext, fontSize: '0.65rem' }}>{m.month}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#58a6ff' }} />
                <span style={{ fontSize: '0.75rem', color: subtext }}>Base Salary</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#FFD700' }} />
                <span style={{ fontSize: '0.75rem', color: subtext }}>KPI Bonus</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Top Earners */}
        <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontWeight: '600', color: text, marginBottom: '16px' }}>💵 Top Earners — {FULL_MONTHS[currentMonth - 1]}</div>
          {loading ? <div style={{ textAlign: 'center', padding: '20px', color: subtext }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topEarners.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#58a6ff,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '700', color: 'white', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: '600', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                      <span style={{ fontSize: '0.83rem', color: '#3fb950', fontWeight: '700', flexShrink: 0, marginLeft: '8px' }}>EGP {Math.round(e.net).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#58a6ff' }}>Base: EGP {Number(e.base).toLocaleString()}</span>
                      {e.kpi > 0 && <span style={{ fontSize: '0.7rem', color: '#FFD700' }}>+KPI: EGP {Math.round(e.kpi).toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Payroll */}
        <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontWeight: '600', color: text, marginBottom: '16px' }}>👥 Team Payroll — {FULL_MONTHS[currentMonth - 1]}</div>
          {loading ? <div style={{ textAlign: 'center', padding: '20px', color: subtext }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teamPayroll.slice(0,7).map((team, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.83rem', fontWeight: '600', color: text }}>{TEAM_NAMES[team.team] || team.team}</div>
                    <div style={{ fontSize: '0.7rem', color: subtext, marginTop: '2px' }}>
                      Base: EGP {Math.round(team.base).toLocaleString()} · KPI: EGP {Math.round(team.kpi).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#3fb950' }}>EGP {Math.round(team.net).toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: subtext }}>{team.agents} agents</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Table */}
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, fontWeight: '600', color: text }}>📋 Monthly Summary — {year}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Month','Subscriptions','Calls','Active Agents','Avg Subs/Agent','Total Payroll','KPI Paid'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: subtext, fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: `1px solid ${border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: subtext }}>Loading...</td></tr>
            : monthlyData.map((m, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${dark ? '#161b22' : '#f0f2f5'}`, background: i === currentMonth - 1 ? (dark ? 'rgba(88,166,255,0.05)' : 'rgba(88,166,255,0.03)') : 'transparent' }}>
                <td style={{ padding: '12px 16px', fontWeight: i === currentMonth - 1 ? '700' : '400', color: i === currentMonth - 1 ? '#58a6ff' : text }}>{FULL_MONTHS[i]} {i === currentMonth - 1 ? '← current' : ''}</td>
                <td style={{ padding: '12px 16px', color: '#3fb950', fontWeight: '600' }}>{m.subs.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', color: '#58a6ff' }}>{m.calls.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', color: '#a371f7' }}>{m.agents}</td>
                <td style={{ padding: '12px 16px', color: subtext }}>{m.agents > 0 ? (m.subs / m.agents).toFixed(1) : '0'}</td>
                <td style={{ padding: '12px 16px', color: '#3fb950', fontWeight: '600' }}>EGP {financialData[i] ? Math.round(financialData[i].totalNet).toLocaleString() : '0'}</td>
                <td style={{ padding: '12px 16px', color: '#FFD700' }}>EGP {financialData[i] ? Math.round(financialData[i].totalKpi).toLocaleString() : '0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
