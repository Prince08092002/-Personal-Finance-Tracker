import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        // If token is invalid or expired, log them out
        if (err.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button onClick={() => navigate('/settings')} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
            Settings
          </button>
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
            Log Out
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <h2 style={{ marginBottom: 'var(--space-md)' }}>
          Welcome back, <span style={{ color: 'var(--primary-glow)' }}>{profile?.name || 'User'}</span>!
        </h2>
        
        <p className="color-muted" style={{ marginBottom: 'var(--space-xl)' }}>
          Email: {profile?.email}
        </p>
        
        <div style={{ padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--glass-border)' }}>
          <p className="color-muted text-center">
            Your financial dashboard widgets will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}
