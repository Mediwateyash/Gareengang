import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMemories from '../components/AdminMemories';
import AdminVlogs from '../components/AdminVlogs';
import AdminUsers from '../components/AdminUsers'; // Import User Management
import AdminHome from '../components/AdminHome'; // Import Home Manager
import AdminCategories from '../components/AdminCategories'; // Import Category Manager
import AdminFaces from '../components/AdminFaces'; // Import Faces Manager
import AdminReviews from '../components/AdminReviews'; // Import Reviews Manager
import AdminSubPillars from '../components/AdminSubPillars'; // Import Pillar Media Manager
import AdminSocials from '../components/AdminSocials'; // Import Social Links Manager
import AdminTrips from '../components/AdminTrips'; // Import Trips & Registrations
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { logout, showAuthModal } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeView, setActiveView] = useState('menu'); // 'menu', 'memories', 'vlogs', 'users', 'home', 'faces'

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            setTimeout(() => showAuthModal('login'), 0);
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="dashboard-container">
            {/* Sidebar / Header */}
            <header className="dashboard-header">
                <div className="brand">
                    <img src="/icon.png" alt="Logo" className="dash-logo" />
                    <h1>Admin Panel</h1>
                </div>
                <div className="user-info">
                    <a href="/" target="_blank" rel="noopener noreferrer" className="btn-visit-site" title="View Public Site">
                        🚀 Visit Website
                    </a>
                    <span>Welcome, {user.name}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                {activeView === 'menu' && (
                    <div className="admin-menu-grid">
                        <div className="admin-card" onClick={() => setActiveView('memories')}>
                            <div className="icon">📸</div>
                            <h3>Manage Memories</h3>
                            <p>Photo timeline & captions.</p>
                        </div>

                        <div className="admin-card" onClick={() => setActiveView('vlogs')}>
                            <div className="icon">🎥</div>
                            <h3>Manage Vlogs</h3>
                            <p>YouTube links & library.</p>
                        </div>

                        <div className="admin-card" onClick={() => setActiveView('home')}>
                            <div className="icon">🏠</div>
                            <h3>Home Page Manager</h3>
                            <p>Feature top content.</p>
                        </div>

                        <div className="admin-card" onClick={() => setActiveView('users')}>
                            <div className="icon">👥</div>
                            <h3>Manage Users</h3>
                            <p>Admin access control.</p>
                        </div>

                        <div className="admin-card" onClick={() => setActiveView('categories')}>
                            <div className="icon">🏷️</div>
                            <h3>Categories</h3>
                            <p>Create & Edit Categories.</p>
                        </div>

                        <div className="admin-card" onClick={() => setActiveView('faces')}>
                            <div className="icon">👤</div>
                            <h3>Faces of GareebGang</h3>
                            <p>Manage members and unique traits.</p>
                        </div>

                        <div className="admin-card" onClick={() => setActiveView('reviews')}>
                            <div className="icon">⭐️</div>
                            <h3>Video Reviews</h3>
                            <p>Manage YouTube video testimonials.</p>
                        </div>

                        <div className="admin-card" onClick={() => setActiveView('pillarmedia')}>
                            <div className="icon">📸</div>
                            <h3>Pillar Moments</h3>
                            <p>Behind-the-scenes action photos & videos.</p>
                        </div>

                        <div className="admin-card" onClick={() => setActiveView('socials')}>
                            <div className="icon">🔗</div>
                            <h3>Social Links</h3>
                            <p>Manage Instagram, YouTube, and FB links.</p>
                        </div>

                        <div className="admin-card" onClick={() => setActiveView('trips')}>
                            <div className="icon">⛺</div>
                            <h3>Trips & Bookings</h3>
                            <p>Manage trips & Razorpay slot fees.</p>
                        </div>
                    </div>
                )}

                {activeView === 'memories' && <AdminMemories onBack={() => setActiveView('menu')} />}
                {activeView === 'vlogs' && <AdminVlogs onBack={() => setActiveView('menu')} />}
                {activeView === 'users' && <AdminUsers onBack={() => setActiveView('menu')} />}
                {activeView === 'home' && <AdminHome onBack={() => setActiveView('menu')} />}
                {activeView === 'categories' && <AdminCategories onBack={() => setActiveView('menu')} />}
                {activeView === 'faces' && <AdminFaces onBack={() => setActiveView('menu')} />}
                {activeView === 'reviews' && <AdminReviews onBack={() => setActiveView('menu')} />}
                {activeView === 'pillarmedia' && <AdminSubPillars onBack={() => setActiveView('menu')} />}
                {activeView === 'socials' && <AdminSocials onBack={() => setActiveView('menu')} />}
                {activeView === 'trips' && <AdminTrips onBack={() => setActiveView('menu')} />}
            </main>
        </div>
    );
};

export default Dashboard;
