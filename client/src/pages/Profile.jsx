import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL, { API_BASE_URL } from '../config';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('bookings'); // bookings, likes
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        if (parsedUser && parsedUser.id) {
            fetchProfileData(parsedUser.id);
        }
    }, [navigate]);

    const fetchProfileData = async (userId) => {
        try {
            const res = await fetch(`${API_URL}/users/profile/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div className="loading-spinner">Loading Profile...</div>;
    if (!profileData) return <div className="error-msg">Error loading profile data.</div>;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/150';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="profile-avatar-wrapper">
                    <img src={getImageUrl(profileData.image)} alt="Avatar" className="profile-avatar" />
                    <button className="btn-edit-avatar">✏️ Edit</button>
                </div>
                <div className="profile-info">
                    <h1>{profileData.name}</h1>
                    <p>📞 {profileData.phone}</p>
                    <div className="profile-actions">
                        <button className="btn-outline-primary">Change Password</button>
                        <button onClick={handleLogout} className="btn-outline-danger">Logout</button>
                    </div>
                </div>
            </header>

            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    🏕️ My Bookings
                </button>
                <button
                    className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('likes')}
                >
                    ❤️ Liked Memories
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'bookings' && (
                    <div className="bookings-grid">
                        {profileData.myBookings && profileData.myBookings.length > 0 ? (
                            profileData.myBookings.map((booking, idx) => (
                                <div key={idx} className="profile-card booking-card">
                                    <h3>{booking.tripId ? booking.tripId.title : 'Deleted Trip'}</h3>
                                    <p>Status: <span className={`status-${booking.paymentStatus.toLowerCase()}`}>{booking.paymentStatus}</span></p>
                                    <p>Paid: ₹{booking.amountPaid}</p>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">You haven't booked any trips yet!</div>
                        )}
                    </div>
                )}

                {activeTab === 'likes' && (
                    <div className="likes-grid">
                        {profileData.likedMemories && profileData.likedMemories.length > 0 ? (
                            profileData.likedMemories.map((memory) => (
                                <div key={memory._id} className="profile-card memory-card">
                                    <img src={getImageUrl(memory.image)} alt="Liked Memory" />
                                    <p>{memory.title}</p>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No liked memories found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
