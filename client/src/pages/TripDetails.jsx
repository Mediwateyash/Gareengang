import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiUrl, { API_BASE_URL } from '../config';
import './TripDetails.css';

const TripDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking Modal State
    const [showModal, setShowModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', queries: '' });

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchTrip = async () => {
            try {
                const res = await fetch(`${apiUrl}/trips/${id}`);
                if (!res.ok) throw new Error('Trip not found');
                const data = await res.json();
                setTrip(data);
            } catch (err) {
                console.error(err);
                navigate('/trips');
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id, navigate]);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const initRes = await fetch(`${apiUrl}/registrations/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId: trip._id, ...formData })
            });
            const initData = await initRes.json();
            if (!initRes.ok || !initData.success) {
                alert('Could not initiate booking. ' + (initData.message || ''));
                setIsProcessing(false);
                return;
            }

            const options = {
                key: initData.key_id,
                amount: initData.order.amount,
                currency: "INR",
                name: "GareebGang Trips",
                description: `Slot Booking: ${trip.title}`,
                order_id: initData.order.id,
                handler: async function (response) {
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
                            // refresh to update slot count locally
                            const refetch = await fetch(`${apiUrl}/trips/${id}`);
                            setTrip(await refetch.json());
                        } else {
                            alert("Payment verification failed! Please contact support.");
                        }
                    } catch (err) {
                        alert("An error occurred verifying your slot.");
                    }
                },
                prefill: { name: formData.name, contact: formData.phone },
                theme: { color: "#10b981" }
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (res) { alert("Payment Failed: " + res.error.description); });
            rzp.open();
        } catch (error) {
            alert("Booking gateway could not be loaded.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="trips-loader">Loading Journey Details...</div>;
    if (!trip) return <div className="trips-loader">Trip Not Found</div>;

    const bgUrl = trip.coverImage.startsWith('http') ? trip.coverImage : `${API_BASE_URL}/${trip.coverImage}`;
    const totalBudget = trip.budgetBreakdown ? trip.budgetBreakdown.reduce((acc, curr) => acc + curr.amount, 0) : 0;

    return (
        <div className="trip-details-page">
            <div className="trip-banner" style={{ backgroundImage: `url(${bgUrl})` }}>
                <div className="trip-banner-overlay"></div>
                <div className="trip-banner-content">
                    <button onClick={() => navigate('/trips')} className="btn-back-trips">← Back to Trips</button>
                    <div className="trip-banner-badges">
                        <span className={`status-badge ${trip.status === 'Booking Open' ? 'open' : trip.status === 'Completed' ? 'completed' : 'soon'}`}>
                            {trip.status}
                        </span>
                        <span className="location-badge">📍 {trip.destination}</span>
                    </div>
                    <h1 className="trip-banner-title">{trip.title}</h1>
                    <p className="trip-banner-dates">🗓️ {trip.dateDisplay}</p>
                </div>
            </div>

            <div className="trip-details-container">
                <div className="trip-main-content">

                    {/* Overview */}
                    <section className="detail-section">
                        <h2>📖 Overview</h2>
                        <div className="detail-card overview-card">
                            <p>{trip.overview || trip.shortDescription || 'No overview provided.'}</p>
                        </div>
                    </section>

                    {/* Itinerary */}
                    {trip.itinerary && trip.itinerary.length > 0 && (
                        <section className="detail-section">
                            <h2>🗓️ Itinerary</h2>
                            <div className="itinerary-timeline">
                                {trip.itinerary.map((day, idx) => (
                                    <div key={idx} className="timeline-item">
                                        <div className="timeline-dot">Day {day.day}</div>
                                        <div className="timeline-content">
                                            <h3>{day.title}</h3>
                                            <p>{day.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Budget Breakdown */}
                    {trip.budgetBreakdown && trip.budgetBreakdown.length > 0 && (
                        <section className="detail-section">
                            <h2>💰 Budget Breakdown</h2>
                            <div className="detail-card budget-card">
                                <ul className="budget-list">
                                    {trip.budgetBreakdown.map((b, idx) => (
                                        <li key={idx}>
                                            <span className="b-category">{b.category}</span>
                                            <span className="b-amount">₹{b.amount}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="budget-total">
                                    <span>Estimated Total</span>
                                    <span>₹{totalBudget}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* What to Carry */}
                    {trip.checklist && trip.checklist.length > 0 && (
                        <section className="detail-section">
                            <h2>📦 What To Carry</h2>
                            <div className="detail-card checklist-card">
                                <ul>
                                    {trip.checklist.map((item, idx) => (
                                        <li key={idx}>✅ {item}</li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    )}

                    {/* Map */}
                    {trip.mapEmbedUrl && (
                        <section className="detail-section">
                            <h2>📍 Location Map</h2>
                            <div className="map-container detail-card">
                                <iframe
                                    src={trip.mapEmbedUrl}
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Map Location"
                                ></iframe>
                            </div>
                        </section>
                    )}

                    {/* Gallery */}
                    {trip.gallery && trip.gallery.length > 0 && (
                        <section className="detail-section">
                            <h2>📸 Gallery & References</h2>
                            <div className="gallery-grid">
                                {trip.gallery.map((imgUrl, idx) => (
                                    <img key={idx} src={imgUrl} alt={`Gallery ${idx}`} className="gallery-img" />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="trip-sidebar">
                    {/* Booking Card */}
                    <div className="sidebar-card booking-widget">
                        <h3>Secure Your Slot</h3>
                        <div className="widget-price">
                            <span>Advance Fee</span>
                            <strong>₹{trip.bookingFee}</strong>
                        </div>
                        <div className="widget-slots">
                            <div className="slot-bar-bg">
                                <div className="slot-bar-fill" style={{ width: `${(trip.bookedSlots / trip.totalSlots) * 100}%` }}></div>
                            </div>
                            <p>{Math.max(0, trip.totalSlots - trip.bookedSlots)} slots left out of {trip.totalSlots}</p>
                        </div>

                        {trip.status === 'Booking Open' ? (
                            <button className="btn-sidebar-book" onClick={() => { setBookingSuccess(false); setShowModal(true); }}>
                                Book Now
                            </button>
                        ) : (
                            <button className="btn-sidebar-book disabled" disabled>
                                {trip.status === 'Completed' ? 'Trip Completed' : 'Registrations Closed'}
                            </button>
                        )}
                        <p className="secure-note">🔒 Payments securely processed by Razorpay</p>
                    </div>

                    {/* Trip Organizer and Manager */}
                    {trip.tripLeader && trip.tripLeader.name && (
                        <div className="sidebar-card leader-widget">
                            <h3>👤 Trip Organizer and Manager</h3>
                            <div className="leader-info">
                                <strong>{trip.tripLeader.name}</strong>
                                {trip.tripLeader.phone && <p>📞 {trip.tripLeader.phone}</p>}
                                {trip.tripLeader.instagram && <a href={trip.tripLeader.instagram} target="_blank" rel="noreferrer">📱 Instagram Profile</a>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal">
                        <button className="btn-close-modal" onClick={() => !isProcessing && setShowModal(false)} disabled={isProcessing}>&times;</button>
                        {bookingSuccess ? (
                            <div className="booking-success">
                                <h2>🎉 Slot Confirmed!</h2>
                                <p>You have successfully booked your slot for <strong>{trip.title}</strong>.</p>
                                <p>Wait for instructions from {trip.tripLeader?.name || 'the Organizer'}.</p>
                                <button className="btn-pay-now" onClick={() => setShowModal(false)} style={{ marginTop: '2rem' }}>Close</button>
                            </div>
                        ) : (
                            <>
                                <h2>Complete Registration</h2>
                                <p className="modal-fee-alert">Advance Slot Booking Payment: <strong>₹{trip.bookingFee}</strong></p>
                                <form onSubmit={handlePaymentSubmit} className="booking-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required disabled={isProcessing} />
                                    </div>
                                    <div className="form-group">
                                        <label>WhatsApp Number</label>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required disabled={isProcessing} />
                                    </div>
                                    <div className="form-group">
                                        <label>Any Queries (Optional)</label>
                                        <textarea rows="3" value={formData.queries} onChange={e => setFormData({ ...formData, queries: e.target.value })} disabled={isProcessing}></textarea>
                                    </div>
                                    <button type="submit" className="btn-pay-now" disabled={isProcessing}>
                                        {isProcessing ? 'Processing Securely...' : `Advance Slot Booking Payment: ₹${trip.bookingFee}`}
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

export default TripDetails;
