import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/categories';
import { createExpense } from '../api/expenses';
import './AddExpensePage.css';

export default function AddExpensePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories().then(r => {
      setCategories(r.data);
      if (r.data.length > 0) setCategoryId(r.data[0].id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!categoryId || !amount) { setError('Category and amount are required.'); return; }
    setSaving(true);
    try {
      await createExpense({ categoryId: Number(categoryId), amount: parseFloat(amount), note, date });
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-expense-page">
      <div className="page-header">
        <h1 className="page-title">Add Expense</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/expenses')}>Cancel</button>
      </div>

      <form className="expense-form card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Lunch at cafe"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Expense'}
        </button>
      </form>
    </div>
  );
}
