import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';
import '../components/AuthModal.css'; // Reusing base AuthModal styles for the brutalist form

const AdminLogin = () => {
    const { login, setShowWelcomeToast } = useAuth();
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({ loginId: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });
            const data = await res.json();

            if (res.ok) {
                // Security Check: Only allow Admins to login via this portal
                if (data.user.role === 'admin') {
                    login(data.user);
                    setShowWelcomeToast(true);
                    navigate('/dashboard');
                } else {
                    setErrorMsg('Access Denied: Standard users cannot access the Admin Portal.');
                }
            } else {
                setErrorMsg(data.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Admin Login Error:', err);
            setErrorMsg('Login failed. Please check network.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            padding: '20px'
        }}>
            <div className="auth-modal-container" style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
                <div className="auth-modal-header" style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: '#fef08a' }}>GareebGang Admin Secure Portal</h2>
                    <p style={{ color: '#94a3b8' }}>Authorized Personnel Only.</p>
                </div>

                {errorMsg && <div className="auth-modal-error" style={{ background: '#7f1d1d', color: '#fecaca', border: '1px solid #b91c1c' }}>{errorMsg}</div>}

                <div className="auth-modal-body">
                    <form onSubmit={handleAdminLogin} className="auth-modal-form">
                        <div className="form-group">
                            <label style={{ color: '#e2e8f0' }}>Admin Username</label>
                            <input
                                type="text"
                                placeholder="Enter Admin Username"
                                required
                                value={loginData.loginId}
                                onChange={(e) => setLoginData({ ...loginData, loginId: e.target.value })}
                                style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ color: '#e2e8f0' }}>Master Password</label>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                required
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-auth-submit"
                            disabled={isLoading}
                            style={{ background: '#ca8a04', color: '#fefce8', marginTop: '20px' }}
                        >
                            {isLoading ? 'Authenticating...' : 'Access Command Center'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
