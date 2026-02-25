import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiUrl, { API_BASE_URL } from '../config';
import './HomeTrips.css';

const HomeTrips = () => {
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await fetch(`${apiUrl}/trips`);
                const data = await res.json();

                // Only show active booking trips on the homepage
                const activeTrips = data.filter(t => t.status === 'Booking Open' || t.status === 'Coming Soon').slice(0, 3);
                setTrips(activeTrips);
            } catch (err) {
                console.error("Failed to load trips for home widget:", err);
            }
        };
        fetchTrips();
    }, []);

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x300';
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    if (trips.length === 0) return null; // Hide section entirely if no active trips exist

    return (
        <section className="home-trips-section">
            <div className="container">
                <div className="ht-header">
                    <h2>Upcoming Adventures</h2>
                    <p>Pack your bags, GareebGang is hitting the road again! Secure your slot before it sells out.</p>
                </div>

                <div className="ht-grid">
                    {trips.map(trip => (
                        <div key={trip._id} className="ht-card">
                            <div className="ht-image-wrapper">
                                <img src={getImageUrl(trip.coverImage)} alt={trip.title} />
                                <div className={`ht-badge ${trip.status === 'Booking Open' ? 'open' : 'soon'}`}>
                                    {trip.status}
                                </div>
                            </div>
                            <div className="ht-content">
                                <div className="ht-meta">
                                    <span className="ht-date">📅 {trip.dateDisplay}</span>
                                    <span className="ht-location">📍 {trip.destination}</span>
                                </div>
                                <h3 className="ht-title">{trip.title}</h3>
                                <p className="ht-desc">{trip.shortDescription}</p>

                                <div className="ht-footer">
                                    <div className="ht-price">
                                        <span className="label">Advance Fee</span>
                                        <strong>₹{trip.bookingFee}</strong>
                                    </div>
                                    <Link to={`/trips/${trip._id}`} className="ht-btn">View Details</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="ht-view-all">
                    <Link to="/trips" className="btn-view-all-trips">Explore All Trips →</Link>
                </div>
            </div>
        </section>
    );
};

export default HomeTrips;
