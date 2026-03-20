import { useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import Loader from '../components/Loader';
import './CategoriesPage.css';

const COLORS = ['#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#06b6d4','#64748b','#ef4444'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => getCategories().then(r => setCategories(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    try {
      await createCategory({ name: name.trim(), color });
      setName(''); setColor(COLORS[0]); setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot delete');
    }
  };

  const defaults = categories.filter(c => c.default);
  const custom = categories.filter(c => !c.default);

  if (loading) return <Loader fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <form className="cat-form card" onSubmit={handleCreate}>
          <div className="cat-form-row">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Category name"
              required
            />
            <div className="color-picker">
              {COLORS.map(c => (
                <button
                  key={c} type="button"
                  className={'color-dot' + (color === c ? ' selected' : '')}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>
      )}

      <h2 className="cat-section-title">Default Categories</h2>
      <div className="cat-grid">
        {defaults.map(c => (
          <div key={c.id} className="cat-chip" style={{ borderColor: c.color }}>
            <span className="cat-dot" style={{ background: c.color }} />
            <span>{c.name}</span>
          </div>
        ))}
      </div>

      {custom.length > 0 && (
        <>
          <h2 className="cat-section-title">Custom Categories</h2>
          <div className="cat-grid">
            {custom.map(c => (
              <div key={c.id} className="cat-chip" style={{ borderColor: c.color }}>
                <span className="cat-dot" style={{ background: c.color }} />
                <span>{c.name}</span>
                <button className="cat-delete" onClick={() => handleDelete(c.id)}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
