import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Restoration States
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your identifier and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.action === 'PROMPT_RESTORE') {
        setShowRestorePrompt(true);
      } else {
        setError(err.response?.data?.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const res = await axios.post('http://localhost:5000/api/auth/restore/direct', { identifier: email, password });
        if (res.data.success) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data));
            navigate('/dashboard');
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to restore account using these credentials.');
    } finally {
        setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    navigate('/register', { state: { identifier: email, requireOverwrite: true } });
  };

  return (
    <div className="auth-card">
      <div class="auth-header">
        <h2 className="auth-title">
          {showRestorePrompt ? 'Account Deactivated' : 'Welcome Back'}
        </h2>
        <p className="auth-subtitle">
          {showRestorePrompt ? 'This account was previously deleted.' : 'Log in to manage your finances'}
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <svg style={{width:'20px',height:'20px', flexShrink: 0}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      {/* STANDARD LOGIN VIEW */}
      {!showRestorePrompt && (
        <form onSubmit={handleLogin} className="form-group">
          <div className="form-group">
            <label className="form-label">Email or Phone Number</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="you@example.com or phone"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group mt-4">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? <div className="btn-loader"></div> : 'Sign In'}
          </button>
        </form>
      )}

      {/* PROMPT RESTORE VIEW */}
      {showRestorePrompt && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', textAlign: 'center' }}>
          <p className="color-muted" style={{ marginBottom: '1rem' }}>
            Your account was deleted, but your data is still recoverable. Do you want to restore it using the password you just entered?
          </p>
          <button className="btn btn-primary" onClick={handleRestore} disabled={loading}>
            {loading ? <div className="btn-loader"></div> : 'Restore Account Now'}
          </button>
          <button className="btn btn-outline" onClick={handleGoToRegister} disabled={loading} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            Start Fresh (Wipe Data)
          </button>
          <button className="btn btn-outline" onClick={() => setShowRestorePrompt(false)} disabled={loading} style={{ border: 'none' }}>
            Cancel
          </button>
        </div>
      )}

      {!showRestorePrompt && (
        <p className="text-center text-sm color-muted mt-4">
          Don't have an account? <Link to="/register">Create one here</Link>
        </p>
      )}
    </div>
  );
}
