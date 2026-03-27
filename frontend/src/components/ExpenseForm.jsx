import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ExpenseForm({ token, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');
  const [expenseList, setExpenseList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories', {
        params: { page: 1, limit: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
          setCategoryId(String(res.data.data[0].id));
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expenses', {
        params: { page: 1, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setExpenseList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  const handleCreateCategory = async () => {
    const categoryName = newCategoryName.trim();
    if (!categoryName) {
      setError('Please enter a category name');
      return;
    }

    setCreatingCategory(true);
    setError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/categories',
        { name: categoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setNewCategoryName('');
        await fetchCategories();
        setCategoryId(String(res.data.data.id));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = { amount: Number(amount), categoryId, description, expenseDate };
      const res = editingId
        ? await axios.put(`http://localhost:5000/api/expenses/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post('http://localhost:5000/api/expenses', payload, { headers: { Authorization: `Bearer ${token}` } });
      
      console.log('Expense saved:', res.data);
      if (res.data.success) {
        resetForm();
        await fetchExpenses();
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setAmount(String(item.amount));
    setDescription(item.description || '');
    setExpenseDate(item.expense_date?.split('T')[0] || item.expense_date);
    setCategoryId(String(item.category_id));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchExpenses();
      onSuccess();
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="auth-card" style={{ padding: 'var(--space-md)', margin: '0 auto', maxWidth: '100%', gap: 'var(--space-xl)' }}>
      <h3 className="settings-header">{editingId ? 'Update Expense' : 'Add Expense'}</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input 
            type="number" 
            step="0.01"
            className="form-input" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Category</label>
          <select 
            className="form-input" 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)}
            required
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Create New Category</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              type="text"
              className="form-input"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Utilities"
            />
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: 'auto', whiteSpace: 'nowrap' }}
              disabled={creatingCategory}
              onClick={handleCreateCategory}
            >
              {creatingCategory ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={expenseDate} 
            onChange={(e) => setExpenseDate(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <input 
            type="text" 
            className="form-input" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || !amount || !categoryId}>
            {loading ? <div className="btn-loader"></div> : <span className={loading ? 'btn-text-hide' : ''}>{editingId ? 'Update Expense' : 'Add Expense'}</span>}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm} style={{ width: 'auto' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="settings-header" style={{ marginBottom: 'var(--space-md)' }}>Recent Expenses</h3>
        {expenseList.length === 0 ? (
          <p className="color-muted">No expense entries yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {expenseList.map((item) => (
              <div key={item.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{item.category_name} - ₹{Number(item.amount).toFixed(2)}</p>
                  <p className="color-muted text-sm" style={{ margin: 0 }}>{new Date(item.expense_date).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => handleEdit(item)} style={{ width: 'auto' }}>Edit</button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(item.id)} style={{ width: 'auto' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
