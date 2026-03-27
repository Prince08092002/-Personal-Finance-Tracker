import { useEffect, useState } from 'react';
import axios from 'axios';

export default function IncomeForm({ token, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [frequency, setFrequency] = useState('one-time');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [incomeList, setIncomeList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchIncome = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/income', {
        params: { page: 1, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setIncomeList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching income list:', err);
    }
  };

  useEffect(() => {
    fetchIncome();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    setAmount('');
    setSource('');
    setFrequency('one-time');
    setIncomeDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = { amount: Number(amount), source, frequency, incomeDate };
      const res = editingId
        ? await axios.put(`http://localhost:5000/api/income/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post('http://localhost:5000/api/income', payload, { headers: { Authorization: `Bearer ${token}` } });
      
      console.log('Income saved:', res.data);
      if (res.data.success) {
        resetForm();
        await fetchIncome();
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving income:', err);
      setError(err.response?.data?.message || 'Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setAmount(String(item.amount));
    setSource(item.source);
    setFrequency(item.frequency);
    setIncomeDate(item.income_date?.split('T')[0] || item.income_date);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/income/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchIncome();
      onSuccess();
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete income');
    }
  };

  return (
    <div className="auth-card" style={{ padding: 'var(--space-md)', margin: '0 auto', maxWidth: '100%', gap: 'var(--space-xl)' }}>
      <h3 className="settings-header">{editingId ? 'Update Income' : 'Add Income'}</h3>
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
          <label className="form-label">Source / Title</label>
          <input 
            type="text" 
            className="form-input" 
            value={source} 
            onChange={(e) => setSource(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Frequency</label>
          <select 
            className="form-input" 
            value={frequency} 
            onChange={(e) => setFrequency(e.target.value)}
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <option value="one-time">One-Time</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={incomeDate} 
            onChange={(e) => setIncomeDate(e.target.value)} 
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || !amount || !source}>
            {loading ? <div className="btn-loader"></div> : <span className={loading ? 'btn-text-hide' : ''}>{editingId ? 'Update Income' : 'Add Income'}</span>}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm} style={{ width: 'auto' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="settings-header" style={{ marginBottom: 'var(--space-md)' }}>Recent Income</h3>
        {incomeList.length === 0 ? (
          <p className="color-muted">No income entries yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {incomeList.map((item) => (
              <div key={item.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{item.source} - ₹{Number(item.amount).toFixed(2)}</p>
                  <p className="color-muted text-sm" style={{ margin: 0 }}>{item.frequency} | {new Date(item.income_date).toLocaleDateString()}</p>
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
