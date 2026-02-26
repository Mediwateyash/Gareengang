import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Registration successful! Please login.');
                navigate('/login');
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="tel"
                        placeholder="WhatsApp Number"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
                <p>Already have an account? <Link to="/login">Login</Link></p>
                <Link to="/" className="back-link">Back to Home</Link>
            </div>
        </div>
    );
};

export default Register;
