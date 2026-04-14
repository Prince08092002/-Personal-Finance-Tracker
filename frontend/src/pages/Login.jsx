import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EyeIcon = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {open ? (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M10.58 10.58A2 2 0 0 0 12 15a2 2 0 0 0 1.42-.58" />
        <path d="M9.88 5.09A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a17.2 17.2 0 0 1-3.34 4.68" />
        <path d="M6.61 6.61A17.2 17.2 0 0 0 2 12s3.5 7 10 7a10.48 10.48 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </>
    )}
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);
  const navigate = useNavigate();

  // Restoration States
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  useEffect(() => {
    if (lockSeconds <= 0) return;
    const t = setInterval(() => setLockSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [lockSeconds]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (lockSeconds > 0) {
      setError(`Try again after ${lockSeconds} seconds`);
      return;
    }

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
      if (err.response?.status === 429 && err.response?.data?.action === 'LOGIN_LOCKED') {
        const sec = Number(err.response?.data?.retryAfterSec || 30);
        setLockSeconds(sec);
        setError(`Try again after ${sec} seconds`);
      } else
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
        if (err.response?.status === 429 && err.response?.data?.action === 'LOGIN_LOCKED') {
          const sec = Number(err.response?.data?.retryAfterSec || 30);
          setLockSeconds(sec);
          setError(`Try again after ${sec} seconds`);
        } else {
          setError(err.response?.data?.message || 'Failed to restore account using these credentials.');
        }
    } finally {
        setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    navigate('/register', { state: { identifier: email, requireOverwrite: true } });
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              placeholder="Enter your email or phone"
            />
          </div>

          <div className="form-group mt-4">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Enter your password"
                style={{ paddingRight: '3rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '2.25rem',
                  height: '2.25rem',
                  padding: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading || lockSeconds > 0}>
            {loading ? <div className="btn-loader"></div> : lockSeconds > 0 ? `Try again in ${lockSeconds}s` : 'Sign In'}
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
