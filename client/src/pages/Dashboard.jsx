import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMemories from '../components/AdminMemories';
import AdminVlogs from '../components/AdminVlogs';
import AdminUsers from '../components/AdminUsers';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState('');
    const [activeView, setActiveView] = useState('home'); // home, memories, vlogs, users
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

    // Render Logic
    const renderContent = () => {
        switch (activeView) {
            case 'memories':
                return <AdminMemories onBack={() => setActiveView('home')} />;
            case 'vlogs':
                return <AdminVlogs onBack={() => setActiveView('home')} />;
            case 'users':
                return <AdminUsers onBack={() => setActiveView('home')} />;
            default:
                return (
                    <div className="dashboard-home animate-fade-in">
                        <h2 className="welcome-title">What would you like to manage?</h2>
                        <div className="dashboard-cards">

                            <div className="dash-card" onClick={() => setActiveView('memories')}>
                                <div className="card-icon">📸</div>
                                <h3>Memories</h3>
                                <p>Add photos, manage the timeline, edit captions.</p>
                            </div>

                            <div className="dash-card" onClick={() => setActiveView('vlogs')}>
                                <div className="card-icon">🎥</div>
                                <h3>Vlogs</h3>
                                <p>Add YouTube links, manage video gallery.</p>
                            </div>

                            <div className="dash-card" onClick={() => setActiveView('users')}>
                                <div className="card-icon">🛡️</div>
                                <h3>Admins</h3>
                                <p>Grant access to new team members.</p>
                            </div>

                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="brand">
                    <h1>GareebGang Admin</h1>
                    <span className="badge">Command Center</span>
                </div>
                <div className="user-info">
                    <span>Hello, <strong>{user}</strong></span>
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
