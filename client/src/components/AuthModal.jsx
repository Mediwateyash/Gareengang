import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css'; // We'll create this next

const AuthModal = () => {
    const { isAuthModalOpen, hideAuthModal, authModalTab, setAuthModalTab, login, setShowWelcomeToast } = useAuth();
    const navigate = useNavigate();

    // Form States
    const [loginData, setLoginData] = useState({ loginId: '', password: '' });
    const [registerData, setRegisterData] = useState({ name: '', username: '', phone: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isAuthModalOpen) return null;

    const handleLoginSubmit = async (e) => {
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
                login(data.user);
                hideAuthModal();
                setShowWelcomeToast(true);

                // If admin logs in from modal, optionally redirect them to dashboard
                if (data.user.role === 'admin') {
                    navigate('/dashboard');
                }
            } else {
                setErrorMsg(data.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Login failed. Please check network.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData),
            });

            if (res.ok) {
                // Auto-login after successful registration, or switch to login tab
                alert('Registration successful! Please login.');
                setAuthModalTab('login');
                // Pre-fill login phone number
                setLoginData(prev => ({ ...prev, loginId: registerData.phone }));
            } else {
                const data = await res.json();
                setErrorMsg(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Registration failed. Please check network.');
        } finally {
            setIsLoading(false);
        }
    };

    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (e.target.className === 'auth-modal-overlay') {
            hideAuthModal();
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={handleOverlayClick}>
            <div className="auth-modal-container">
                <button className="auth-modal-close" onClick={hideAuthModal}>&times;</button>

                <div className="auth-modal-header">
                    <h2>Welcome to GareebGang</h2>
                    <p>Join the community to book trips and explore memories.</p>
                </div>

                <div className="auth-modal-tabs">
                    <button
                        className={`auth-tab ${authModalTab === 'login' ? 'active' : ''}`}
                        onClick={() => { setAuthModalTab('login'); setErrorMsg(''); }}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${authModalTab === 'register' ? 'active' : ''}`}
                        onClick={() => { setAuthModalTab('register'); setErrorMsg(''); }}
                    >
                        Register
                    </button>
                </div>

                {errorMsg && <div className="auth-modal-error">{errorMsg}</div>}

                <div className="auth-modal-body">
                    {authModalTab === 'login' ? (
                        <form onSubmit={handleLoginSubmit} className="auth-modal-form">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter Username"
                                    required
                                    value={loginData.loginId}
                                    onChange={(e) => setLoginData({ ...loginData, loginId: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter Password"
                                    required
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login Securely'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit} className="auth-modal-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Yash Diwate"
                                    required
                                    value={registerData.name}
                                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Username <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="Choose a unique username"
                                    required
                                    value={registerData.username}
                                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>WhatsApp Number (Optional)</label>
                                <input
                                    type="tel"
                                    placeholder="10-digit number"
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10 digit number"
                                    value={registerData.phone}
                                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Create Password</label>
                                <input
                                    type="password"
                                    placeholder="Make it secure"
                                    required
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
