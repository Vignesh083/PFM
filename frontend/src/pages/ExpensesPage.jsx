import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpenses, deleteExpense } from '../api/expenses';
import { getCategories } from '../api/categories';
import './ExpensesPage.css';

function monthLabel(m) {
  const [y, mo] = m.split('-');
  return new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
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

function fmt(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
}

export default function ExpensesPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [month, setMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  );
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // filter state
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const load = useCallback((m, cat, kw) => {
    setLoading(true);
    getExpenses(m, cat || undefined, kw || undefined)
      .then(r => setExpenses(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { getCategories().then(r => setCategories(r.data)); }, []);
  useEffect(() => { load(month, filterCat, search); }, [month, filterCat, search]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await deleteExpense(id);
    load(month, filterCat, search);
  };

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <button className="btn btn-primary" onClick={() => navigate('/expenses/add')}>+ Add</button>
      </div>

      {/* Month navigator */}
      <div className="month-nav card">
        <button className="btn btn-ghost" onClick={() => setMonth(prevMonth(month))}>‹</button>
        <span className="month-label">{monthLabel(month)}</span>
        <button className="btn btn-ghost" onClick={() => setMonth(nextMonth(month))}>›</button>
        <span className="month-total">{fmt(total)}</span>
      </div>

      {/* Filter bar */}
      <div className="filter-bar card">
        <input
          className="filter-search"
          type="text"
          placeholder="🔍 Search by note..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="filter-cat"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {(search || filterCat) && (
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterCat(''); }}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : expenses.length === 0 ? (
        <p className="empty-state">No expenses found.</p>
      ) : (
        <div className="expense-list">
          {expenses.map(e => (
            <div key={e.id} className="expense-row card">
              <span className="exp-dot" style={{ background: e.categoryColor || '#6366f1' }} />
              <div className="exp-info">
                <span className="exp-cat">{e.categoryName}</span>
                {e.note && <span className="exp-note">{e.note}</span>}
              </div>
              <span className="exp-date">{e.date}</span>
              <span className="exp-amount">{fmt(e.amount)}</span>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
