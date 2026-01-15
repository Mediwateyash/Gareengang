import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('adminUser', data.username);
                navigate('/dashboard');
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
                <h2>Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <p>Don't have an account? <Link to="/register">Register</Link></p>
                <Link to="/" className="back-link">Back to Home</Link>
            </div>
        </div>
    );
};

export default Login;
