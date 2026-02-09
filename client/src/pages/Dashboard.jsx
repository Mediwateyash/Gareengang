import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMemories from '../components/AdminMemories';
import AdminVlogs from '../components/AdminVlogs';
import AdminUsers from '../components/AdminUsers'; // Import User Management
import AdminHome from '../components/AdminHome'; // Import Home Manager
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeView, setActiveView] = useState('menu'); // 'menu', 'memories', 'vlogs', 'users', 'home'

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="dashboard-container">
            {/* Sidebar / Header */}
            <header className="dashboard-header">
                <div className="brand">
                    <img src="/logo-placeholder.png" alt="Logo" className="dash-logo" />
                    <h1>Admin Panel</h1>
                </div>
                <div className="user-info">
                    <span>Welcome, {user.name}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;
