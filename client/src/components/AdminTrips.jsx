import React, { useState, useEffect } from 'react';
import apiUrl from '../config';

const AdminTrips = ({ onBack }) => {
    const [trips, setTrips] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [activeTab, setActiveTab] = useState('trips'); // 'trips' or 'registrations'

    // Form state for new/edit trip
    const [isEditing, setIsEditing] = useState(false);
    const [currentTripId, setCurrentTripId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        dateDisplay: '',
        status: 'Coming Soon',
        bookingFee: 50,
        totalSlots: 20,
        itinerary: '',
        galleryReferenceLink: '',
        coverImage: null // will handle file later
    });

    useEffect(() => {
        fetchTrips();
        fetchRegistrations();
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await fetch(`${apiUrl}/trips`);
            const data = await res.json();
            setTrips(data);
        } catch (err) { console.error(err); }
    };

    const fetchRegistrations = async () => {
        try {
            const res = await fetch(`${apiUrl}/registrations`);
            const data = await res.json();
            setRegistrations(data);
        } catch (err) { console.error(err); }
    };

    const handleTripSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const submitData = new FormData();

        submitData.append('title', formData.title);
        submitData.append('destination', formData.destination);
        submitData.append('dateDisplay', formData.dateDisplay);
        submitData.append('status', formData.status);
        submitData.append('bookingFee', formData.bookingFee);
        submitData.append('totalSlots', formData.totalSlots);
        submitData.append('itinerary', formData.itinerary);
        submitData.append('galleryReferenceLink', formData.galleryReferenceLink);
        if (formData.coverImage) submitData.append('coverImage', formData.coverImage);

        try {
            const url = isEditing ? `${apiUrl}/trips/${currentTripId}` : `${apiUrl}/trips`;
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: submitData
            });

            if (!res.ok) throw new Error('Failed to save trip');

            resetTripForm();
            fetchTrips();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleTripEdit = (trip) => {
        setFormData({
            title: trip.title,
            destination: trip.destination,
            dateDisplay: trip.dateDisplay,
            status: trip.status,
            bookingFee: trip.bookingFee,
            totalSlots: trip.totalSlots,
            itinerary: trip.itinerary ? trip.itinerary.join('\n') : '',
            galleryReferenceLink: trip.galleryReferenceLink || '',
            coverImage: null
        });
        setCurrentTripId(trip._id);
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const handleTripDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/trips/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchTrips();
        } catch (err) {
            alert(err.message);
        }
    };

    const resetTripForm = () => {
        setFormData({
            title: '', destination: '', dateDisplay: '', status: 'Coming Soon',
            bookingFee: 50, totalSlots: 20, itinerary: '', galleryReferenceLink: '', coverImage: null
        });
        setIsEditing(false);
        setCurrentTripId(null);
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button className="btn-back" onClick={onBack}>← Back to Menu</button>
                <h2>Manage Trips & Bookings</h2>
            </div>

            <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('trips')}
                    style={{ padding: '10px 20px', background: activeTab === 'trips' ? '#3b82f6' : '#e2e8f0', color: activeTab === 'trips' ? 'white' : 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Trips ({trips.length})
                </button>
                <button
                    onClick={() => setActiveTab('registrations')}
                    style={{ padding: '10px 20px', background: activeTab === 'registrations' ? '#10b981' : '#e2e8f0', color: activeTab === 'registrations' ? 'white' : 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Registrations ({registrations.length})
                </button>
            </div>

            {activeTab === 'trips' && (
                <div className="trips-view">
                    <section className="form-section">
                        <h3>{isEditing ? 'Edit Trip' : 'Create New Trip'}</h3>
                        <form onSubmit={handleTripSubmit} className="memory-form">
                            <div className="form-group">
                                <label>Trip Title</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. The Ultimate Kokan Trip" />
                            </div>
                            <div className="form-group">
                                <label>Destination</label>
                                <input type="text" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} required placeholder="e.g. Kokan, Maharashtra" />
                            </div>
                            <div className="form-group">
                                <label>Date Display String</label>
                                <input type="text" value={formData.dateDisplay} onChange={e => setFormData({ ...formData, dateDisplay: e.target.value })} required placeholder="e.g. 12-15 August 2026" />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Coming Soon">Coming Soon (Disabled Button)</option>
                                    <option value="Booking Open">Booking Open (Razorpay Active)</option>
                                    <option value="Completed">Completed (Shows Internal Gallery Link)</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Booking Advance Amount (₹)</label>
                                <input type="number" value={formData.bookingFee} onChange={e => setFormData({ ...formData, bookingFee: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Total Available Slots</label>
                                <input type="number" value={formData.totalSlots} onChange={e => setFormData({ ...formData, totalSlots: e.target.value })} required />
                            </div>
                            <div className="form-group full-width">
                                <label>Cover Image (Required for slider)</label>
                                <input type="file" accept="image/*" onChange={e => setFormData({ ...formData, coverImage: e.target.files[0] })} required={!isEditing} />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-submit">{isEditing ? 'Update Trip' : 'Create Trip'}</button>
                                {isEditing && <button type="button" className="btn-cancel" onClick={resetTripForm}>Cancel Edit</button>}
                            </div>
                        </form>
                    </section>

                    <section className="list-section">
                        <h3>All Trips</h3>
                        <div className="memories-table-wrapper">
                            <table className="memories-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Slots (Booked/Total)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trips.map(trip => (
                                        <tr key={trip._id}>
                                            <td><strong>{trip.title}</strong><br />{trip.destination}</td>
                                            <td>{trip.dateDisplay}</td>
                                            <td><span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                background: trip.status === 'Booking Open' ? '#dcfce7' : trip.status === 'Completed' ? '#e0e7ff' : '#fef9c3',
                                                color: trip.status === 'Booking Open' ? '#166534' : trip.status === 'Completed' ? '#3730a3' : '#854d0e'
                                            }}>{trip.status}</span></td>
                                            <td>{trip.bookedSlots} / {trip.totalSlots}</td>
                                            <td>
                                                <button onClick={() => handleTripEdit(trip)} className="btn-action edit">Edit</button>
                                                <button onClick={() => handleTripDelete(trip._id)} className="btn-action delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'registrations' && (
                <div className="registrations-view">
                    <section className="list-section">
                        <h3>Trip Slot Registrations</h3>
                        <div className="memories-table-wrapper">
                            <table className="memories-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Trip</th>
                                        <th>User Details</th>
                                        <th>Status / Amount</th>
                                        <th>Order ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map(reg => (
                                        <tr key={reg._id}>
                                            <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                                            <td>{reg.tripId ? reg.tripId.title : 'Deleted Trip'}</td>
                                            <td>
                                                <strong>{reg.name}</strong><br />
                                                {reg.phone}<br />
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{reg.email || 'No email'}</span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                    background: reg.paymentStatus === 'Completed' ? '#dcfce7' : reg.paymentStatus === 'Pending' ? '#fef9c3' : '#fee2e2',
                                                    color: reg.paymentStatus === 'Completed' ? '#166534' : reg.paymentStatus === 'Pending' ? '#854d0e' : '#991b1b'
                                                }}>{reg.paymentStatus}</span><br />
                                                ₹{reg.amountPaid}
                                            </td>
                                            <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                                {reg.razorpayOrderId}
                                            </td>
                                        </tr>
                                    ))}
                                    {registrations.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No registrations found yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminTrips;
