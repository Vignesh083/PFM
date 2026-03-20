import { useEffect, useState } from 'react';
import { getRecurring, createRecurring, toggleRecurring, deleteRecurring } from '../api/recurring';
import { getCategories } from '../api/categories';
import './RecurringPage.css';

function fmt(v) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v ?? 0);
}

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

export default function RecurringPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [error, setError] = useState('');

  const load = () => getRecurring().then(r => setItems(r.data)).catch(() => {});

  useEffect(() => {
    load();
    getCategories().then(r => {
      setCategories(r.data);
      if (r.data.length > 0) setCategoryId(r.data[0].id);
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createRecurring({
        categoryId: Number(categoryId),
        amount: parseFloat(amount),
        description,
        dayOfMonth: Number(dayOfMonth),
        startDate: new Date().toISOString().slice(0, 10),
      });
      setAmount(''); setDescription(''); setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleToggle = async (id) => {
    await toggleRecurring(id); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this recurring expense?')) return;
    await deleteRecurring(id); load();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Recurring Expenses</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Add Recurring'}
        </button>
      </div>

      {showForm && (
        <form className="card recurring-form" onSubmit={handleCreate}>
          <div className="rf-row">
            <div className="rf-group">
              <label>Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="rf-group">
              <label>Amount (₹)</label>
              <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" required />
            </div>
            <div className="rf-group">
              <label>Day of month</label>
              <select value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="rf-group full">
            <label>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Netflix subscription" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="empty-state">No recurring expenses set up yet.</p>
      ) : (
        <div className="recurring-list">
          {items.map(item => (
            <div key={item.id} className={`card recurring-row ${!item.active ? 'inactive' : ''}`}>
              <span className="rec-dot" style={{ background: item.categoryColor || '#6366f1' }} />
              <div className="rec-info">
                <span className="rec-name">{item.categoryName}</span>
                {item.description && <span className="rec-desc">{item.description}</span>}
                <span className="rec-day">Every {item.dayOfMonth}{getDaySuffix(item.dayOfMonth)} of the month</span>
              </div>
              <span className="rec-amount">{fmt(item.amount)}</span>
              <span className={`rec-badge ${item.active ? 'active' : 'paused'}`}>
                {item.active ? 'Active' : 'Paused'}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(item.id)}>
                {item.active ? 'Pause' : 'Resume'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDaySuffix(d) {
  if (d === 1 || d === 21) return 'st';
  if (d === 2 || d === 22) return 'nd';
  if (d === 3 || d === 23) return 'rd';
  return 'th';
}
