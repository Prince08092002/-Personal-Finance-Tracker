import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TransactionList from '../components/TransactionList';

const toDateOrNull = (value) => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null);
const pad2 = (n) => String(n).padStart(2, '0');
const formatYmd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const startOfWeekMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // move to Monday
  date.setDate(date.getDate() + diff);
  return date;
};

const endOfWeekSunday = (d) => {
  const start = startOfWeekMonday(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

export default function TransactionHistory() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [draftType, setDraftType] = useState('all');
  const [draftQuery, setDraftQuery] = useState('');
  const [draftRange, setDraftRange] = useState('custom'); // custom, daily, weekly, monthly, yearly
  const [draftAnchorDate, setDraftAnchorDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [draftAnchorMonth, setDraftAnchorMonth] = useState(`${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}`); // YYYY-MM
  const [draftAnchorYear, setDraftAnchorYear] = useState(String(new Date().getFullYear())); // YYYY
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');

  const [filters, setFilters] = useState({
    type: 'all',
    q: '',
    from: null,
    to: null
  });

  const fetchTransactions = async (targetPage) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: targetPage,
        limit
      };

      if (filters.type && filters.type !== 'all') params.type = filters.type;
      if (filters.q) params.q = filters.q;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await axios.get('http://localhost:5000/api/transactions', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setTransactions(res.data.data || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleApplyFilters = () => {
    let from = null;
    let to = null;

    if (draftRange === 'daily') {
      const day = toDateOrNull(draftAnchorDate);
      from = day;
      to = day;
    } else if (draftRange === 'weekly') {
      const anchor = toDateOrNull(draftAnchorDate);
      if (anchor) {
        const start = startOfWeekMonday(new Date(anchor));
        const end = endOfWeekSunday(new Date(anchor));
        from = formatYmd(start);
        to = formatYmd(end);
      }
    } else if (draftRange === 'monthly') {
      const m = /^\d{4}-\d{2}$/.test(draftAnchorMonth) ? draftAnchorMonth : null;
      if (m) {
        const [y, mm] = m.split('-').map(Number);
        const start = new Date(y, mm - 1, 1);
        const end = new Date(y, mm, 0); // last day of month
        from = formatYmd(start);
        to = formatYmd(end);
      }
    } else if (draftRange === 'yearly') {
      const y = /^\d{4}$/.test(draftAnchorYear) ? Number(draftAnchorYear) : null;
      if (y) {
        from = `${y}-01-01`;
        to = `${y}-12-31`;
      }
    } else {
      from = toDateOrNull(draftFrom);
      to = toDateOrNull(draftTo);
    }

    setFilters({
      type: draftType,
      q: draftQuery.trim(),
      from,
      to
    });
    setPage(1);
  };

  const handleClear = () => {
    setDraftType('all');
    setDraftQuery('');
    setDraftRange('custom');
    setDraftAnchorDate(new Date().toISOString().split('T')[0]);
    setDraftAnchorMonth(`${new Date().getFullYear()}-${pad2(new Date().getMonth() + 1)}`);
    setDraftAnchorYear(String(new Date().getFullYear()));
    setDraftFrom('');
    setDraftTo('');
    setFilters({ type: 'all', q: '', from: null, to: null });
    setPage(1);
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1 className="auth-title" style={{ fontSize: '1.5rem', margin: 0 }}>Transaction History</h1>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ padding: '0.4rem 1rem', width: 'auto' }}>
            Back to Dashboard
          </button>
          <button
            className="btn btn-outline"
            style={{ padding: '0.4rem 1rem', width: 'auto' }}
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="settings-container">
        <div className="settings-card" style={{ padding: 'var(--space-lg)' }}>
          <h2 className="settings-header" style={{ marginBottom: 'var(--space-sm)' }}>Filters</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-input"
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-input"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="Search by title/description"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Range</label>
              <select
                className="form-input"
                value={draftRange}
                onChange={(e) => setDraftRange(e.target.value)}
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <option value="custom">Custom</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {draftRange === 'daily' && (
              <div className="form-group">
                <label className="form-label">Day</label>
                <input
                  type="date"
                  className="form-input"
                  value={draftAnchorDate}
                  onChange={(e) => setDraftAnchorDate(e.target.value)}
                />
              </div>
            )}

            {draftRange === 'weekly' && (
              <div className="form-group">
                <label className="form-label">Week of</label>
                <input
                  type="date"
                  className="form-input"
                  value={draftAnchorDate}
                  onChange={(e) => setDraftAnchorDate(e.target.value)}
                />
              </div>
            )}

            {draftRange === 'monthly' && (
              <div className="form-group">
                <label className="form-label">Month</label>
                <input
                  type="month"
                  className="form-input"
                  value={draftAnchorMonth}
                  onChange={(e) => setDraftAnchorMonth(e.target.value)}
                />
              </div>
            )}

            {draftRange === 'yearly' && (
              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={draftAnchorYear}
                  onChange={(e) => setDraftAnchorYear(e.target.value)}
                  min="1900"
                  max="2100"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">From</label>
              <input
                type="date"
                className="form-input"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                disabled={draftRange !== 'custom'}
              />
            </div>

            <div className="form-group">
              <label className="form-label">To</label>
              <input
                type="date"
                className="form-input"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                disabled={draftRange !== 'custom'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
            <button type="button" className="btn btn-primary" onClick={handleApplyFilters} style={{ width: 'auto' }}>
              Search
            </button>
            <button type="button" className="btn btn-outline" onClick={handleClear} style={{ width: 'auto', borderColor: 'var(--glass-border)' }}>
              Clear
            </button>
          </div>
        </div>

        <div>
          <h2 className="settings-header" style={{ margin: 'var(--space-md) 0 var(--space-sm)' }}>Transactions</h2>

          {loading ? (
            <div style={{ padding: 'var(--space-md)' }}>
              <div className="btn-loader" style={{ borderColor: 'var(--primary-accent)', borderTopColor: 'transparent', width: '3rem', height: '3rem', position: 'relative', margin: '0 auto' }} />
            </div>
          ) : (
            <TransactionList transactions={transactions} />
          )}

          {error && <div className="alert alert-danger" style={{ marginTop: 'var(--space-md)' }}>{error}</div>}

          {!loading && pagination?.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-sm)', gap: 'var(--space-sm)' }}>
              <button
                className="btn btn-outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ width: 'auto' }}
              >
                Previous
              </button>
              <p className="color-muted text-sm" style={{ margin: 0 }}>
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <button
                className="btn btn-outline"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                style={{ width: 'auto' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

