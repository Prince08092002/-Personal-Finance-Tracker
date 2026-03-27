import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  // Modals state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProfile(response.data.data);
        setPhoneInput(response.data.data.phone_number || '');
      }
    } catch (err) {
      if (err.response?.status === 401) handleLogoutAction();
    }
  };

  const handleUpdatePhone = async () => {
    setLoadingAction(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile/phone', 
        { phone_number: phoneInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setProfile({ ...profile, phone_number: phoneInput });
        setIsEditingPhone(false);
      } else {
        setError(response.data.message || 'Failed to update phone');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update phone');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogoutAction = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setLoadingAction(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await axios.delete('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        handleLogoutAction();
      } else {
        setError(response.data.message || 'Failed to delete account');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setLoadingAction(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1 className="auth-title" style={{ fontSize: '1.5rem', margin: 0 }}>Settings</h1>
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
          Back exactly to Dashboard
        </button>
      </nav>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 0 }}>
          {error}
        </div>
      )}

      <main className="settings-container">
        
        {/* Section: Update Profile */}
        <section className="settings-section">
          <h2 className="settings-header">Update Profile</h2>
          
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-icon">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </div>
              <div className="settings-content">
                <h3 className="settings-title">Phone Number</h3>
                {!isEditingPhone ? (
                  <p className="settings-desc">{profile?.phone_number || 'No phone number added'}</p>
                ) : (
                  <input 
                    type="tel" 
                    className="form-input" 
                    style={{ padding: '0.4rem 0.8rem', marginTop: '4px', width: '100%', maxWidth: '250px' }}
                    value={phoneInput} 
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+1 234 567 8900"
                    autoFocus
                  />
                )}
              </div>
              <div className="settings-action">
                {!isEditingPhone ? (
                  <button className="btn btn-outline" onClick={() => setIsEditingPhone(true)}>Edit</button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ color: 'inherit', borderColor: 'transparent' }} onClick={() => setIsEditingPhone(false)}>Cancel</button>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={handleUpdatePhone} disabled={loadingAction}>Save</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Account Actions */}
        <section className="settings-section">
          <h2 className="settings-header" style={{ marginTop: 'var(--space-md)' }}>Account Actions</h2>
          
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-icon" style={{ color: 'var(--text-muted)' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </div>
              <div className="settings-content">
                <h3 className="settings-title">Logout</h3>
                <p className="settings-desc">Sign out of your account securely</p>
              </div>
              <div className="settings-action">
                <button className="btn btn-outline" onClick={() => setShowLogoutModal(true)}>Logout</button>
              </div>
            </div>

            <div className="settings-divider"></div>

            <div className="settings-row">
              <div className="settings-icon" style={{ color: 'var(--danger)' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </div>
              <div className="settings-content">
                <h3 className="settings-title" style={{ color: 'var(--danger)' }}>Delete Account</h3>
                <p className="settings-desc">Permanently remove your account and all data</p>
              </div>
              <div className="settings-action">
                <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete Account</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>Confirm Logout</h3>
            <p className="color-muted" style={{ marginBottom: 'var(--space-lg)' }}>Are you sure you want to log out of your account?</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleLogoutAction}>Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderTop: '4px solid var(--danger)' }}>
            <h3 style={{ marginBottom: 'var(--space-sm)', color: 'var(--danger)' }}>Delete Account</h3>
            <p className="color-muted" style={{ marginBottom: 'var(--space-lg)' }}>
              This action is permanent and cannot be undone. All your financial data will be erased forever.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={loadingAction}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={loadingAction}>
                {loadingAction ? <div className="btn-loader" style={{position:'static'}}></div> : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
