import { useEffect, useState } from 'react';
import { getBudgetProfile, saveBudgetProfile, getBudgetComparison, setCategoryBudget, deleteCategoryBudget } from '../api/budget';
import { getCategories } from '../api/categories';
import './BudgetPage.css';

function fmt(v, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v ?? 0);
}

function ProgressBar({ percent, color }) {
  const pct = Math.min(percent ?? 0, 100);
  const fill = pct >= 100 ? '#ef4444' : pct >= 75 ? '#f97316' : '#22c55e';
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%`, background: fill }} />
    </div>
  );
}

export default function BudgetPage() {
  const today = new Date();
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [profile, setProfile] = useState({ monthlySalary: '', currency: 'INR' });
  const [comparison, setComparison] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editCatId, setEditCatId] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [saved, setSaved] = useState(false);

  const load = () => {
    getBudgetProfile().then(r => setProfile(r.data)).catch(() => {});
    getBudgetComparison(month).then(r => setComparison(r.data)).catch(() => {});
    getCategories().then(r => setCategories(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await saveBudgetProfile({ monthlySalary: parseFloat(profile.monthlySalary), currency: profile.currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  const handleSetLimit = async (e) => {
    e.preventDefault();
    if (!editCatId || !limitInput) return;
    await setCategoryBudget(Number(editCatId), parseFloat(limitInput));
    setEditCatId(''); setLimitInput('');
    load();
  };

  const handleRemoveLimit = async (categoryId) => {
    await deleteCategoryBudget(categoryId);
    load();
  };

  const salary = parseFloat(profile?.monthlySalary) || 0;
  const totalSpent = comparison.reduce((s, c) => s + parseFloat(c.spent || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Budget</h1>
      </div>

      {/* Salary setup */}
      <div className="card budget-section">
        <h2 className="section-title">Monthly Income</h2>
        <form className="salary-form" onSubmit={handleSaveProfile}>
          <select value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}>
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
          <input
            type="number" min="0" step="100"
            value={profile.monthlySalary ?? ''}
            onChange={e => setProfile(p => ({ ...p, monthlySalary: e.target.value }))}
            placeholder="Monthly salary"
          />
          <button type="submit" className="btn btn-primary">{saved ? 'Saved ✓' : 'Save'}</button>
        </form>

        {salary > 0 && (
          <div className="salary-overview">
            <span>Total Budget: <strong>{fmt(salary, profile.currency)}</strong></span>
            <span>Spent: <strong style={{ color: '#f97316' }}>{fmt(totalSpent, profile.currency)}</strong></span>
            <span>Remaining: <strong style={{ color: totalSpent > salary ? '#ef4444' : '#22c55e' }}>
              {fmt(salary - totalSpent, profile.currency)}</strong></span>
          </div>
        )}
      </div>

      {/* Set category limits */}
      <div className="card budget-section">
        <h2 className="section-title">Set Category Limit</h2>
        <form className="limit-form" onSubmit={handleSetLimit}>
          <select value={editCatId} onChange={e => setEditCatId(e.target.value)} required>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            type="number" min="0" step="100"
            value={limitInput}
            onChange={e => setLimitInput(e.target.value)}
            placeholder="Limit amount"
            required
          />
          <button type="submit" className="btn btn-primary">Set Limit</button>
        </form>
      </div>

      {/* Budget vs Actual */}
      {comparison.length > 0 && (
        <div className="card budget-section">
          <h2 className="section-title">Budget vs Actual — {month}</h2>
          <div className="comparison-list">
            {comparison.map(c => (
              <div key={c.categoryId} className="comparison-row">
                <div className="cmp-header">
                  <span className="cmp-dot" style={{ background: c.categoryColor || '#6366f1' }} />
                  <span className="cmp-name">{c.categoryName}</span>
                  <span className="cmp-amounts">
                    {fmt(c.spent, profile.currency)} / {fmt(c.limitAmount, profile.currency)}
                  </span>
                  <span className={`cmp-pct ${c.percentUsed >= 100 ? 'over' : c.percentUsed >= 75 ? 'warn' : 'ok'}`}>
                    {c.percentUsed.toFixed(0)}%
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveLimit(c.categoryId)}>✕</button>
                </div>
                <ProgressBar percent={c.percentUsed} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
