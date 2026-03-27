import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  useEffect(() => {
      if (location.state?.identifier) {
          setEmail(location.state.identifier);
      }
  }, [location.state]);

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name,
        email,
        password
      });

      if (response.data.success) {
        navigate('/login');
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.action === 'PROMPT_RESTORE') {
        setShowRestorePrompt(true);
      } else {
        setError(err.response?.data?.message || 'Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverwrite = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/overwrite', {
        name,
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to overwrite account.');
      setLoading(false);
    }
  };

  const handleGoToLoginToRestore = () => {
    navigate('/login');
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2 className="auth-title">
          {showRestorePrompt ? 'Account Exists (Deleted)' : 'Create Account'}
        </h2>
        <p className="auth-subtitle">
          {showRestorePrompt ? 'This identifier is tied to a deleted account.' : 'Join us to take control of your finances'}
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <svg style={{width:'20px',height:'20px', flexShrink: 0}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      {!showRestorePrompt ? (
        <form onSubmit={handleRegister} className="form-group">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group mt-4">
            <label className="form-label">Email or Phone</label>
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
            {loading ? <div className="btn-loader"></div> : 'Sign Up'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', textAlign: 'center' }}>
          <p className="color-muted" style={{ marginBottom: '1rem' }}>
            Warning: Overwriting will permanently erase your previous financial data and create a fresh profile.
          </p>
          <button className="btn btn-primary" onClick={handleOverwrite} disabled={loading} style={{ backgroundColor: 'var(--danger)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}>
            {loading ? <div className="btn-loader"></div> : 'Confirm & Erase Form Data'}
          </button>
          <button className="btn btn-outline" onClick={handleGoToLoginToRestore} disabled={loading} style={{ borderColor: 'var(--primary-glow)', color: 'var(--primary-glow)' }}>
            Go to Login (Restore Data)
          </button>
          <button className="btn btn-outline" onClick={() => setShowRestorePrompt(false)} disabled={loading} style={{ border: 'none' }}>
            Cancel
          </button>
        </div>
      )}

      {!showRestorePrompt && (
        <p className="text-center text-sm color-muted mt-4">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      )}
    </div>
  );
}
