import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExpenseForm from '../components/ExpenseForm';
import IncomeForm from '../components/IncomeForm';
import TransactionList from '../components/TransactionList';
import BudgetTracker from '../components/BudgetTracker';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, addExpense, addIncome, budgets
  const [transactionsPage, setTransactionsPage] = useState(1);
  const transactionsLimit = 5;
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchDashboardData = async (page = transactionsPage) => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard', {
        params: { page, limit: transactionsLimit },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDashboardData(response.data.data);
        setTransactionsPage(page);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (err.response?.status === 401) {
          handleLogout();
        }
      }
    };

    if (!token) {
      handleLogout();
      return;
    }

    Promise.all([fetchProfile(), fetchDashboardData()]).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleTransactionSuccess = () => {
    setActiveTab('overview');
    fetchDashboardData(1);
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="btn-loader" style={{ borderColor: 'var(--primary-accent)', borderTopColor: 'transparent', width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1 className="auth-title" style={{ fontSize: '1.5rem', margin: 0 }}>FinanceTracker</h1>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/settings')} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
            Settings
          </button>
          <button onClick={() => navigate('/history')} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
            History
          </button>
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
            Log Out
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div>
            <h2 style={{ marginBottom: 'var(--space-xs)' }}>
              Welcome back, <span style={{ color: 'var(--primary-glow)' }}>{profile?.name || 'User'}</span>!
            </h2>
            <p className="color-muted m-0">Here's your financial overview.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-outline ${activeTab === 'overview' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('overview')}
              style={activeTab === 'overview' ? { background: 'var(--glass-bg)', borderColor: 'var(--primary-glow)' } : {}}
            >
              Overview
            </button>
            <button 
              className={`btn btn-outline ${activeTab === 'addIncome' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('addIncome')}
              style={activeTab === 'addIncome' ? { background: 'var(--success)', borderColor: 'var(--success)', color: 'white' } : {}}
            >
              + Income
            </button>
            <button 
              className={`btn btn-outline ${activeTab === 'addExpense' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('addExpense')}
              style={activeTab === 'addExpense' ? { background: 'var(--danger)', borderColor: 'var(--danger)', color: 'white' } : {}}
            >
              + Expense
            </button>
            <button
              className={`btn btn-outline ${activeTab === 'budgets' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('budgets')}
              style={activeTab === 'budgets' ? { background: 'var(--primary-glow)', borderColor: 'var(--primary-glow)', color: 'white' } : {}}
            >
              Budgets
            </button>
          </div>
        </div>
        
        {activeTab === 'overview' && dashboardData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            
            {/* Cards Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
              
              <div className="settings-card" style={{ padding: 'var(--space-lg)' }}>
                <p className="color-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Balance</p>
                <h2 style={{ fontSize: '2.5rem', margin: 'var(--space-xs) 0', color: dashboardData.remainingBalance >= 0 ? 'var(--text-main)' : 'var(--danger)' }}>
                  ₹{dashboardData.remainingBalance.toFixed(2)}
                </h2>
              </div>
              
              <div className="settings-card" style={{ padding: 'var(--space-lg)', borderTop: '4px solid var(--success)' }}>
                <p className="color-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Income</p>
                <h2 style={{ fontSize: '2rem', margin: 'var(--space-xs) 0', color: 'var(--success)' }}>
                  ₹{dashboardData.totalIncome.toFixed(2)}
                </h2>
              </div>

              <div className="settings-card" style={{ padding: 'var(--space-lg)', borderTop: '4px solid var(--danger)' }}>
                <p className="color-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expenses</p>
                <h2 style={{ fontSize: '2rem', margin: 'var(--space-xs) 0', color: 'var(--danger)' }}>
                  ₹{dashboardData.totalExpense.toFixed(2)}
                </h2>
              </div>
              
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
              {/* Recent Transactions */}
              <div>
                <h3 className="settings-header">Recent Transactions</h3>
                <TransactionList transactions={dashboardData.recentTransactions} />
                {dashboardData.recentTransactionsPagination?.totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-sm)', gap: 'var(--space-sm)' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => fetchDashboardData(transactionsPage - 1)}
                      disabled={transactionsPage <= 1}
                      style={{ width: 'auto' }}
                    >
                      Previous
                    </button>
                    <p className="color-muted text-sm" style={{ margin: 0 }}>
                      Page {dashboardData.recentTransactionsPagination.page} of {dashboardData.recentTransactionsPagination.totalPages}
                    </p>
                    <button
                      className="btn btn-outline"
                      onClick={() => fetchDashboardData(transactionsPage + 1)}
                      disabled={transactionsPage >= dashboardData.recentTransactionsPagination.totalPages}
                      style={{ width: 'auto' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              <div>
                <h3 className="settings-header">Expense by Category</h3>
                {dashboardData.categoryWiseExpense.length === 0 ? (
                  <div style={{ padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--glass-border)' }}>
                    <p className="color-muted text-center" style={{ margin: 0 }}>No expenses to categorize.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {dashboardData.categoryWiseExpense.map((cat, i) => {
                      const percentage = dashboardData.totalExpense > 0 
                        ? (Number(cat.total) / dashboardData.totalExpense) * 100 
                        : 0;
                        
                      return (
                        <div key={i} style={{ background: 'var(--bg-elevated)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                            <span>{cat.category}</span>
                            <span style={{ fontWeight: '600' }}>₹{Number(cat.total).toFixed(2)}</span>
                          </div>
                          <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--primary-glow)', borderRadius: '4px' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'addIncome' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <IncomeForm token={token} onSuccess={handleTransactionSuccess} />
          </div>
        )}

        {activeTab === 'addExpense' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <ExpenseForm token={token} onSuccess={handleTransactionSuccess} />
          </div>
        )}

        {activeTab === 'budgets' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <BudgetTracker token={token} />
          </div>
        )}

      </main>
    </div>
  );
}
