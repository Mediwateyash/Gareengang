import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loggedUser = localStorage.getItem('adminUser');
        if (!loggedUser) {
            navigate('/login');
        } else {
            setUser(loggedUser);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        navigate('/login');
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center', background: 'var(--dark)', minHeight: '100vh', color: 'white' }}>
            <h1>Welcome, {user}!</h1>
            <p style={{ margin: '20px 0', color: '#ccc' }}>This is the protected Admin Dashboard.</p>

            <div style={{ marginTop: '50px', padding: '20px', border: '1px dashed #555', borderRadius: '10px' }}>
                <h3>Stats</h3>
                <p>No data available yet.</p>
            </div>

            <button onClick={handleLogout} className="btn btn-primary" style={{ marginTop: '50px', background: '#333' }}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
