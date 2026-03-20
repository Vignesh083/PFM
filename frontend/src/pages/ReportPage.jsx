import { useEffect, useState } from 'react';
import { getMonthlyReport, downloadCSV } from '../api/reports';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import './ReportPage.css';

function fmt(v, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v ?? 0);
}

function prevMonth(m) {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function nextMonth(m) {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(m) {
  const [y, mo] = m.split('-');
  return new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

export default function ReportPage() {
  const today = new Date();
  const [month, setMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  );
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMonthlyReport(month).then(r => setReport(r.data)).finally(() => setLoading(false));
  }, [month]);

  const handleDownload = async () => {
    const res = await downloadCSV(month);
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `expenses-${month}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const dailyData = report
    ? Object.entries(report.dailyTotals).map(([day, val]) => ({
        day: `${day}`,
        amount: parseFloat(val),
      }))
    : [];

  const currency = 'INR';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Monthly Report</h1>
        <button className="btn btn-primary" onClick={handleDownload}>⬇ Export CSV</button>
      </div>

      {/* Month navigator */}
      <div className="month-nav card" style={{ marginBottom: '1rem' }}>
        <button className="btn btn-ghost" onClick={() => setMonth(prevMonth(month))}>‹</button>
        <span className="month-label">{monthLabel(month)}</span>
        <button className="btn btn-ghost" onClick={() => setMonth(nextMonth(month))}>›</button>
      </div>

      {loading ? <p className="empty-state">Loading...</p> : !report ? null : (
        <>
          {/* Summary cards */}
          <div className="report-stats">
            <div className="rstat card">
              <span className="rstat-label">Total Spent</span>
              <span className="rstat-val spent">{fmt(report.totalSpent, currency)}</span>
            </div>
            <div className="rstat card">
              <span className="rstat-label">Monthly Salary</span>
              <span className="rstat-val">{fmt(report.salary, currency)}</span>
            </div>
            <div className="rstat card">
              <span className="rstat-label">Savings</span>
              <span className="rstat-val" style={{ color: report.savings >= 0 ? '#22c55e' : '#ef4444' }}>
                {fmt(report.savings, currency)}
              </span>
            </div>
          </div>

          {/* Daily spend bar chart */}
          <div className="card report-section">
            <h2 className="section-title">Day-by-Day Spending</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(v, currency)} contentStyle={{ background: '#0e0e2a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, color: '#f1f5f9' }} />
                <Bar dataKey="amount" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown table */}
          <div className="card report-section">
            <h2 className="section-title">Category Breakdown</h2>
            {report.categoryBreakdown.length === 0 ? (
              <p className="empty-state">No expenses this month.</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>% of Total</th>
                    <th>Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {report.categoryBreakdown.sort((a, b) => b.amount - a.amount).map(c => (
                    <tr key={c.categoryId}>
                      <td>
                        <span className="cat-dot-sm" style={{ background: c.categoryColor }} />
                        {c.categoryName}
                      </td>
                      <td>{fmt(c.amount, currency)}</td>
                      <td>{c.percentage.toFixed(1)}%</td>
                      <td>
                        <div className="mini-bar-track">
                          <div className="mini-bar-fill" style={{ width: `${c.percentage}%`, background: c.categoryColor }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
