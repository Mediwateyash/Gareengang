import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './TripsPage.css';
import apiUrl, { API_BASE_URL } from '../config';

const TripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // Booking Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        queries: ''
    });

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await fetch(`${apiUrl}/trips`);
                const data = await res.json();
                setTrips(data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch trips:', err);
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    const handleBookingClick = (trip) => {
        setSelectedTrip(trip);
        setBookingSuccess(false);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (!isProcessing) {
            setShowModal(false);
            setSelectedTrip(null);
            setFormData({ name: '', phone: '', queries: '' });
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTrip) return;

        setIsProcessing(true);
        try {
            // 1. Initiate Registration & Get Razorpay Order
            const initRes = await fetch(`${apiUrl}/registrations/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId: selectedTrip._id,
                    ...formData
                })
            });
            const initData = await initRes.json();

            if (!initRes.ok || !initData.success) {
                alert('Could not initiate booking. ' + (initData.message || ''));
                setIsProcessing(false);
                return;
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: initData.key_id,
                amount: initData.order.amount,
                currency: "INR",
                name: "GareebGang Trips",
                description: `Slot Booking: ${selectedTrip.title}`,
                order_id: initData.order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch(`${apiUrl}/registrations/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                registrationId: initData.registrationId,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            setBookingSuccess(true);
                            // Refresh trips to update slot counts
                            const tripsRes = await fetch(`${apiUrl}/trips`);
                            setTrips(await tripsRes.json());
                        } else {
                            alert("Payment verification failed! Please contact support.");
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        alert("An error occurred verifying your slot. Contact Admin.");
                    }
                },
                prefill: {
                    name: formData.name,
                    contact: formData.phone
                },
                theme: { color: "#10b981" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error("Booking error:", error);
            alert("Booking gateway could not be loaded.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="trips-loader">Loading Epic Journeys...</div>;

    const activeTrips = trips.filter(t => t.status === 'Booking Open' || t.status === 'Coming Soon');

    // Dynamically group ALL trips by their `section` field
    // Default to 'General Trips' if an old document lacks it
    const groupedTrips = trips.reduce((acc, trip) => {
        const sectionName = trip.section || 'Upcoming Trips';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(trip);
        return acc;
    }, {});

    return (
        <div className="trips-page-container">
            {/* HERO CAROUSEL SECTION */}
            <section className="trips-hero-section">
                {activeTrips.length > 0 ? (
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay, EffectFade]}
                        effect="fade"
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        loop={true}
                        className="trips-hero-swiper"
                    >
                        {activeTrips.map(trip => (
                            <SwiperSlide key={trip._id}>
                                <div className="hero-slide-wrapper">
                                    <div
                                        className="hero-bg-img"
                                        style={{ backgroundImage: `url(${trip.coverImage.startsWith('http') ? trip.coverImage : `${API_BASE_URL}/${trip.coverImage}`})` }}
                                    ></div>
                                    <div className="hero-overlay"></div>
                                    <div className="hero-content">
                                        <div className="trip-status-badge">
                                            {trip.status === 'Booking Open' ? '🔥 Booking Open' : '⏳ Coming Soon'}
                                        </div>
                                        <h1 className="hero-title">{trip.title}</h1>
                                        <p className="hero-dates">{trip.destination} • {trip.dateDisplay}</p>

                                        <div className="hero-cta-container">
                                            {trip.status === 'Booking Open' ? (
                                                <button onClick={() => handleBookingClick(trip)} className="btn-book-now glass-effect">
                                                    Secure Your Slot (₹{trip.bookingFee})
                                                </button>
                                            ) : (
                                                <button disabled className="btn-coming-soon glass-effect disabled">
                                                    Registrations Opening Soon
                                                </button>
                                            )}
                                        </div>
                                        <div className="slots-info">
                                            {trip.status === 'Booking Open' && (
                                                <span>Slots: {trip.bookedSlots} / {trip.totalSlots}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="no-active-trips-hero">
                        <h2>GareebGang Adventures</h2>
                        <p>No new trips at the moment. Check out our past journeys below!</p>
                    </div>
                )}
            </section>

            {/* DYNAMIC TRIP SECTIONS GRID */}
            <div className="trips-grid-wrapper">
                {Object.keys(groupedTrips).map(sectionTitle => (
                    <section key={sectionTitle} className={`trips-grid-section ${sectionTitle.toLowerCase().includes('past') || sectionTitle.toLowerCase().includes('completed') ? 'past' : ''}`}>
                        <div className="section-header">
                            <h2 className="section-title">
                                {/* Splitting the title simply to highlight the last word matching our current styling */}
                                {sectionTitle.split(' ').slice(0, -1).join(' ')} <span>{sectionTitle.split(' ').slice(-1)}</span>
                            </h2>
                            <p className="section-subtitle">Explore events under {sectionTitle}</p>
                        </div>
                        <div className="trips-grid">
                            {groupedTrips[sectionTitle].map(trip => (
                                <Link to={`/trips/${trip._id}`} key={trip._id} className={`trip-card ${trip.status === 'Completed' ? 'completed' : ''}`}>
                                    <div className="trip-card-img" style={{ backgroundImage: `url(${trip.coverImage.startsWith('http') ? trip.coverImage : `${API_BASE_URL}/${trip.coverImage}`})` }}>
                                        {trip.status === 'Completed' ? (
                                            <div className="trip-card-badge completed">
                                                ✅ Attempted successfully
                                            </div>
                                        ) : (
                                            <div className={`trip-card-badge ${trip.status === 'Booking Open' ? 'open' : 'soon'}`}>
                                                {trip.status === 'Booking Open' ? '🟢 Booking Open' : '⏳ Coming Soon'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="trip-card-content">
                                        <h3 className="trip-card-title" style={{ color: trip.status === 'Completed' ? '#94a3b8' : 'inherit' }}>{trip.title}</h3>
                                        <div className="trip-card-meta">
                                            <span>📍 {trip.destination}</span>
                                            <span>🗓️ {trip.dateDisplay}</span>
                                        </div>
                                        {trip.shortDescription && trip.status !== 'Completed' && <p className="trip-card-desc">{trip.shortDescription}</p>}

                                        <div className="trip-card-footer" style={{ justifyContent: trip.status === 'Completed' ? 'center' : 'space-between' }}>
                                            {trip.status === 'Completed' ? (
                                                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>View Gallery & Memories →</span>
                                            ) : (
                                                <>
                                                    <div className="trip-card-cost">
                                                        <span className="cost-label">Booking Advance</span>
                                                        <span className="cost-val">₹{trip.bookingFee}</span>
                                                    </div>
                                                    <div className="trip-card-slots">
                                                        <span>Slots Available</span>
                                                        <strong>{Math.max(0, trip.totalSlots - trip.bookedSlots)}</strong>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* BOOKING MODAL */}
            {showModal && selectedTrip && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal">
                        <button className="btn-close-modal" onClick={handleCloseModal} disabled={isProcessing}>&times;</button>

                        {bookingSuccess ? (
                            <div className="booking-success">
                                <h2>🎉 Slot Confirmed!</h2>
                                <p>You have successfully booked your slot for <strong>{selectedTrip.title}</strong>.</p>
                                <p>President Yash will contact you soon with further details.</p>
                                <button className="btn-book-now" onClick={handleCloseModal} style={{ marginTop: '2rem' }}>Close</button>
                            </div>
                        ) : (
                            <>
                                <h2>Secure Your Slot</h2>
                                <p className="modal-trip-title">{selectedTrip.title} ({selectedTrip.dateDisplay})</p>
                                <p className="modal-fee-alert">Advance Booking Fee: <strong>₹{selectedTrip.bookingFee}</strong></p>

                                <form onSubmit={handlePaymentSubmit} className="booking-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required disabled={isProcessing} placeholder="e.g. Yash Diwate" />
                                    </div>
                                    <div className="form-group">
                                        <label>WhatsApp Number</label>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required disabled={isProcessing} placeholder="e.g. 9876543210" />
                                    </div>
                                    <div className="form-group">
                                        <label>Any Queries (Optional)</label>
                                        <textarea rows="3" value={formData.queries} onChange={e => setFormData({ ...formData, queries: e.target.value })} disabled={isProcessing} placeholder="Ask us anything here..."></textarea>
                                    </div>
                                    <button type="submit" className="btn-pay-now" disabled={isProcessing}>
                                        {isProcessing ? 'Processing Securely...' : `Pay ₹${selectedTrip.bookingFee} & Confirm`}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripsPage;
