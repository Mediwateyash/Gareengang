import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ loginId: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));

                // Route based on role
                if (data.user.role === 'admin') {
                    navigate('/dashboard');
                } else {
                    navigate('/'); // Back to homepage for normal users
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="WhatsApp Number or Username"
                        required
                        value={formData.loginId}
                        onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <p>New to GareebGang? <Link to="/register">Create an Account</Link></p>
                <Link to="/" className="back-link">Back to Home</Link>
            </div>
        </div>
    );
};

export default Login;
