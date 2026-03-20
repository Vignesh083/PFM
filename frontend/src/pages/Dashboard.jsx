import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailySummary, getMonthlySummary, getYearlySummary } from '../api/summary';
import { getBudgetProfile } from '../api/budget';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './Dashboard.css';

function fmt(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function MonthlyOverview({ salary, spent, currency, navigate }) {
  const balance = salary - spent;
  const pct = salary > 0 ? Math.min((spent / salary) * 100, 100) : 0;
  const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f97316' : pct >= 60 ? '#eab308' : '#22c55e';
  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (!salary || salary <= 0) {
    return (
      <div className="monthly-overview card no-salary">
        <p className="no-salary-msg">💡 Set your monthly salary to track how much you have left this month.</p>
        <button className="btn btn-primary" onClick={() => navigate('/budget')}>Set Salary</button>
      </div>
    );
  }

  return (
    <div className="monthly-overview card">
      <div className="mo-header">
        <span className="mo-title">Monthly Overview — {monthName}</span>
        <span className="mo-pct" style={{ color: barColor }}>{pct.toFixed(1)}% spent</span>
      </div>

      {/* Progress bar */}
      <div className="mo-track">
        <div className="mo-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>

      {/* Three stats */}
      <div className="mo-stats">
        <div className="mo-stat">
          <span className="mo-stat-label">Monthly Salary</span>
          <span className="mo-stat-val salary">{fmt(salary, currency)}</span>
        </div>
        <div className="mo-divider" />
        <div className="mo-stat">
          <span className="mo-stat-label">Spent This Month</span>
          <span className="mo-stat-val spent">{fmt(spent, currency)}</span>
        </div>
        <div className="mo-divider" />
        <div className="mo-stat">
          <span className="mo-stat-label">Balance Remaining</span>
          <span className="mo-stat-val" style={{ color: balance >= 0 ? '#22c55e' : '#ef4444' }}>
            {fmt(balance, currency)}
          </span>
          {balance < 0 && <span className="mo-overspent-badge">Over budget!</span>}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, total, currency, breakdown }) {
  const data = (breakdown ?? []).map(b => ({
    name: b.categoryName,
    value: parseFloat(b.amount),
    color: b.categoryColor,
  }));

  return (
    <div className="summary-card card">
      <p className="summary-label">{label}</p>
      <p className="summary-total">{fmt(total, currency)}</p>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} paddingAngle={2}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color || '#6366f1'} />)}
            </Pie>
            <Tooltip formatter={(v) => fmt(v, currency)} contentStyle={{ background: '#0e0e2a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, color: '#f1f5f9', fontSize: '0.82rem' }} />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="no-data">No expenses yet</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const today = new Date();
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const dateStr = today.toISOString().slice(0, 10);

  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [yearly, setYearly] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getDailySummary(dateStr).then(r => setDaily(r.data)).catch(() => {});
    getMonthlySummary(month).then(r => setMonthly(r.data)).catch(() => {});
    getYearlySummary(today.getFullYear()).then(r => setYearly(r.data)).catch(() => {});
    getBudgetProfile().then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const currency = profile?.currency || 'INR';
  const salary = parseFloat(profile?.monthlySalary ?? 0);
  const monthSpent = parseFloat(monthly?.total ?? 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/expenses/add')}>
          + Add Expense
        </button>
      </div>

      <MonthlyOverview salary={salary} spent={monthSpent} currency={currency} navigate={navigate} />

      <div className="summary-grid">
        <SummaryCard label="Today" total={daily?.total} currency={currency} breakdown={daily?.breakdown} />
        <SummaryCard label="This Month" total={monthly?.total} currency={currency} breakdown={monthly?.breakdown} />
        <SummaryCard label="This Year" total={yearly?.total} currency={currency} breakdown={yearly?.breakdown} />
      </div>
    </div>
  );
}
