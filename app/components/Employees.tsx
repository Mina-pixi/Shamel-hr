'use client';
import { useEffect, useState } from 'react';
import { pointsDB, crmDB } from '@/lib/supabase';

const TEAMS = ['Team 1','Team 2','Team 3','Team 4','Team 5','Team 6','Team On Ground','Team I Career','Team Seniors leader'];

export default function Employees({ dark, t }: { dark?: boolean, t?: any }) {
  const theme = t || { panel: '#161b22', panelBorder: '#21262d', text: '#e6edf3', subtext: '#8b949e', inputBg: '#0d1117', inputBorder: '#30363d', tableBorder: '#161b22' };
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', national_id: '',
    base_salary: '', bonus_per_sub: '50',
    team_name: 'Team 1', hire_date: new Date().toISOString().split('T')[0],
    bank_account: '',
  });
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await pointsDB.from('hr_employees').select('*').order('name');
    setEmployees(data || []);
    setLoading(false);
  };

  const save = async () => {
    if (!form.name || !form.email || !form.base_salary) {
      setMsg('❌ Name, email and salary are required');
      return;
    }
    setSaving(true);
    setMsg('');

    // Check if agent exists in points DB
    const { data: agent } = await pointsDB.from('agents').select('id,crm_id').eq('email', form.email).single();

    // Insert HR employee
    const { error } = await pointsDB.from('hr_employees').insert({
      agent_id: agent?.id || null,
      crm_id: agent?.crm_id || null,
      name: form.name,
      email: form.email,
      phone: form.phone,
      national_id: form.national_id,
      base_salary: Number(form.base_salary),
      bonus_per_sub: Number(form.bonus_per_sub),
      team_name: form.team_name,
      hire_date: form.hire_date,
      bank_account: form.bank_account,
    });

    if (error) {
      setMsg(`❌ Error: ${error.message}`);
    } else {
      setMsg('✅ Employee added successfully!');
      setForm({ name: '', email: '', phone: '', national_id: '', base_salary: '', bonus_per_sub: '50', team_name: 'Team 1', hire_date: new Date().toISOString().split('T')[0], bank_account: '' });
      setShowForm(false);
      load();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await pointsDB.from('hr_employees').update({ is_active: !current }).eq('id', id);
    load();
  };

  const saveEdit = async () => {
    const { error } = await pointsDB.from('hr_employees').update({
      name: editForm.name,
      base_salary: Number(editForm.base_salary),
      kpi_amount: Number(editForm.kpi_amount),
      bonus_per_sub: Number(editForm.bonus_per_sub),
      team_name: editForm.team_name,
      phone: editForm.phone,
      national_id: editForm.national_id,
      bank_account: editForm.bank_account,
      hire_date: editForm.hire_date,
    }).eq('id', editId);
    if (!error) { setEditId(null); load(); }
    else alert('Error: ' + error.message);
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.team_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs><linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3fb950"/><stop offset="100%" stopColor="#2ea043"/></linearGradient></defs>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="url(#eg)" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="7" r="4" stroke="url(#eg)" strokeWidth="2"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="url(#eg)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Employees</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '220px' }} />
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #3fb950, #2ea043)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {showForm ? '✕ Cancel' : '+ Add Employee'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '20px' }}>➕ Add New Employee</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { label: 'Full Name *', key: 'name', placeholder: 'Employee name' },
              { label: 'Email *', key: 'email', placeholder: 'name_telesales@vezeeta.com' },
              { label: 'Phone', key: 'phone', placeholder: '01XXXXXXXXX' },
              { label: 'National ID', key: 'national_id', placeholder: '29XXXXXXXXXXX' },
              { label: 'Bank Account', key: 'bank_account', placeholder: 'Account number' },
              { label: 'Hire Date', key: 'hire_date', type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '6px' }}>{f.label}</div>
                <input
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <div style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '6px' }}>Team</div>
              <select value={form.team_name} onChange={e => setForm({ ...form, team_name: e.target.value })}>
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '6px' }}>Base Salary (EGP) *</div>
              <input type="number" placeholder="3000" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: e.target.value })} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '6px' }}>KPI Amount (EGP)</div>
              <input type="number" placeholder="2000" value={form.bonus_per_sub} onChange={e => setForm({ ...form, bonus_per_sub: e.target.value })} />
              <div style={{ fontSize: '0.68rem', color: '#8b949e', marginTop: '4px' }}>Earned when agent hits 80%+ of 60 subs target</div>
            </div>
          </div>
          {msg && <div style={{ margin: '12px 0', fontSize: '0.85rem', color: msg.includes('✅') ? '#3fb950' : '#f85149' }}>{msg}</div>}
          <button onClick={save} disabled={saving} style={{ marginTop: '16px', padding: '10px 32px', background: 'linear-gradient(135deg, #58a6ff, #1f6feb)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>
            {saving ? 'Saving...' : '✓ Save Employee'}
          </button>
        </div>
      )}

      {/* Employee Table */}
      <div className="glass-panel">
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '600' }}>All Employees ({filtered.length})</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Email', 'Team', 'Base Salary', 'Bonus/Sub', 'Hire Date', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: '#8b949e', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #21262d' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>No employees found. Add your first employee!</td></tr>
            ) : filtered.map((e, i) => (<>
              <tr key={e.id} style={{ borderBottom: '1px solid #161b22' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #58a6ff, #a371f7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', color: 'white', marginRight: '10px', verticalAlign: 'middle' }}>
                    {e.name[0].toUpperCase()}
                  </div>
                  {e.name}
                </td>
                <td style={{ padding: '12px 16px', color: '#8b949e', fontSize: '0.83rem' }}>{e.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }}>{e.team_name || 'Unassigned'}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#3fb950', fontWeight: '600' }}>EGP {Number(e.base_salary).toLocaleString()}</td>
                <td style={{ padding: '12px 16px', color: '#FFD700' }}>EGP {Number(e.bonus_per_sub)}</td>
                <td style={{ padding: '12px 16px', color: '#8b949e', fontSize: '0.83rem' }}>{e.hire_date || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '600', background: e.is_active ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)', color: e.is_active ? '#3fb950' : '#f85149' }}>
                    {e.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: '6px' }}>
                  <button onClick={() => { setEditId(editId === e.id ? null : e.id); setEditForm({...e}); }} style={{ fontSize: '0.72rem', padding: '4px 10px', background: editId === e.id ? 'rgba(88,166,255,0.2)' : 'none', border: '1px solid #58a6ff', borderRadius: '6px', color: '#58a6ff', cursor: 'pointer' }}>
                    {editId === e.id ? 'Cancel' : 'Edit'}
                  </button>
                  <button onClick={() => toggleActive(e.id, e.is_active)} style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'none', border: '1px solid #30363d', borderRadius: '6px', color: '#8b949e', cursor: 'pointer' }}>
                    {e.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
              {editId === e.id && (
                <tr key={e.id + '_edit'} style={{ background: 'rgba(88,166,255,0.04)', borderBottom: '1px solid #30363d' }}>
                  <td colSpan={8} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '4px' }}>Name</div>
                        <input value={editForm.name || ''} onChange={ev => setEditForm({...editForm, name: ev.target.value})} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', padding: '7px 10px', fontSize: '0.83rem', width: '100%' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '4px' }}>Base Salary (EGP)</div>
                        <input type="number" value={editForm.base_salary || ''} onChange={ev => setEditForm({...editForm, base_salary: ev.target.value})} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#3fb950', padding: '7px 10px', fontSize: '0.83rem', width: '100%' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '4px' }}>KPI Amount (EGP)</div>
                        <input type="number" value={editForm.kpi_amount || ''} onChange={ev => setEditForm({...editForm, kpi_amount: ev.target.value})} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#FFD700', padding: '7px 10px', fontSize: '0.83rem', width: '100%' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '4px' }}>Team</div>
                        <select value={editForm.team_name || ''} onChange={ev => setEditForm({...editForm, team_name: ev.target.value})} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', padding: '7px 10px', fontSize: '0.83rem', width: '100%' }}>
                          {['Team 1','Team 2','Team 3','Team 4','Team 5','Team 6','Team On Ground','Team I Career','Team Seniors leader'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '4px' }}>Phone</div>
                        <input value={editForm.phone || ''} onChange={ev => setEditForm({...editForm, phone: ev.target.value})} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', padding: '7px 10px', fontSize: '0.83rem', width: '100%' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '4px' }}>National ID</div>
                        <input value={editForm.national_id || ''} onChange={ev => setEditForm({...editForm, national_id: ev.target.value})} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', padding: '7px 10px', fontSize: '0.83rem', width: '100%' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '4px' }}>Bank Account</div>
                        <input value={editForm.bank_account || ''} onChange={ev => setEditForm({...editForm, bank_account: ev.target.value})} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', padding: '7px 10px', fontSize: '0.83rem', width: '100%' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#8b949e', marginBottom: '4px' }}>Hire Date</div>
                        <input type="date" value={editForm.hire_date || ''} onChange={ev => setEditForm({...editForm, hire_date: ev.target.value})} style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', padding: '7px 10px', fontSize: '0.83rem', width: '100%' }} />
                      </div>
                    </div>
                    <button onClick={saveEdit} style={{ padding: '8px 24px', background: 'linear-gradient(135deg, #3fb950, #2ea043)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>
                      ✓ Save Changes
                    </button>
                  </td>
                </tr>
              )}
            </>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
