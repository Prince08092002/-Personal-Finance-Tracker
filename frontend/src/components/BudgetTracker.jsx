import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const getCurrentMonthKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatMoney = (value) => {
  const num = Number(value || 0);
  return `₹${num.toFixed(2)}`;
};

export default function BudgetTracker({ token }) {
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());
  const [budgetsData, setBudgetsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draftBudgets, setDraftBudgets] = useState({});
  const [savingCategoryId, setSavingCategoryId] = useState(null);

  const fetchBudgets = async (activeMonthKey) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/budgets', {
        params: { month: activeMonthKey },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBudgetsData(res.data.data);
        const nextDrafts = {};
        for (const item of res.data.data.items) {
          nextDrafts[item.categoryId] = item.budgetAmount;
        }
        setDraftBudgets(nextDrafts);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchBudgets(monthKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, monthKey]);

  const totals = useMemo(() => {
    if (!budgetsData) return { totalBudget: 0, totalActual: 0 };
    return { totalBudget: budgetsData.totalBudget, totalActual: budgetsData.totalActual };
  }, [budgetsData]);

  const handleSaveBudget = async (categoryId) => {
    const raw = draftBudgets[categoryId];
    const budgetAmount = Number(raw);
    if (Number.isNaN(budgetAmount) || budgetAmount < 0) {
      setError('Budget must be a valid number (>= 0).');
      return;
    }

    setSavingCategoryId(categoryId);
    setError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/budgets',
        {
          categoryId,
          month_key: monthKey,
          budgetAmount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setBudgetsData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSavingCategoryId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-md)' }}>
        <div className="btn-loader" style={{ borderColor: 'var(--primary-accent)', borderTopColor: 'transparent', width: '3rem', height: '3rem', position: 'relative', margin: '0 auto' }} />
      </div>
    );
  }

  if (!budgetsData) {
    return (
      <div style={{ padding: 'var(--space-md)' }}>
        <div className="alert alert-danger">{error || 'No budget data available.'}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div className="settings-card" style={{ padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <div>
            <h3 className="settings-header" style={{ margin: 0 }}>Monthly Budgets</h3>
            <p className="color-muted m-0" style={{ marginTop: 'var(--space-xs)' }}>
              Track planned vs actual spending per category.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label className="form-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Month</label>
              <input
                type="month"
                className="form-input"
                style={{ width: '220px' }}
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-xl)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <div>
            <p className="color-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)' }}>Total Budget</p>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-glow)', margin: 0 }}>{formatMoney(totals.totalBudget)}</h2>
          </div>
          <div>
            <p className="color-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)' }}>Actual Spent</p>
            <h2 style={{ fontSize: '1.8rem', color: totals.totalActual > totals.totalBudget && totals.totalBudget > 0 ? 'var(--danger)' : 'var(--success)', margin: 0 }}>
              {formatMoney(totals.totalActual)}
            </h2>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
        {budgetsData.items.map((item) => {
          const budgetAmount = Number(item.budgetAmount || 0);
          const actualAmount = Number(item.actualAmount || 0);
          const hasBudget = budgetAmount > 0;
          const percent = hasBudget ? item.progressPercent : 0;
          const barWidth = hasBudget ? Math.min(100, percent) : 0;
          const isOverBudget = hasBudget && actualAmount > budgetAmount;

          return (
            <div
              key={item.categoryId}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-md)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)', alignItems: 'baseline' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{item.categoryName}</h4>
                <span style={{ color: isOverBudget ? 'var(--danger)' : 'var(--success)', fontWeight: '600' }}>
                  {hasBudget ? `${percent.toFixed(0)}%` : 'Set budget'}
                </span>
              </div>

              <div style={{ marginTop: 'var(--space-sm)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                <span className="color-muted" style={{ fontSize: '0.9rem' }}>Actual: {formatMoney(actualAmount)}</span>
                <span className="color-muted" style={{ fontSize: '0.9rem' }}>Budget: {formatMoney(budgetAmount)}</span>
              </div>

              <div style={{ height: '10px', background: 'var(--bg-surface)', borderRadius: '6px', overflow: 'hidden', marginTop: 'var(--space-sm)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    background: hasBudget ? (isOverBudget ? 'var(--danger)' : 'var(--success)') : 'var(--glass-border)',
                    borderRadius: '6px',
                    transition: 'width 0.25s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Budget Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={draftBudgets[item.categoryId] ?? 0}
                    onChange={(e) => setDraftBudgets((prev) => ({ ...prev, [item.categoryId]: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '0.6rem 1rem' }}
                  disabled={savingCategoryId === item.categoryId}
                  onClick={() => handleSaveBudget(item.categoryId)}
                >
                  {savingCategoryId === item.categoryId ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

