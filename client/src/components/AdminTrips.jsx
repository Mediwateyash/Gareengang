import React, { useState, useEffect } from 'react';
import apiUrl from '../config';

const AdminTrips = ({ onBack }) => {
    const [trips, setTrips] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'hero', 'trips', or 'registrations'

    // Form state for new/edit trip
    const [isEditing, setIsEditing] = useState(false);
    const [currentTripId, setCurrentTripId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        dateDisplay: '',
        status: 'Coming Soon',
        section: 'Upcoming Trips',
        bookingFee: 50,
        totalSlots: 20,
        shortDescription: '',
        overview: '',
        coverImage: null, // file
        mapEmbedUrl: '',
        checklist: '', // comma separated strings
        gallery: '',   // comma separated strings
        tripLeader: { name: 'Yash Diwate', phone: '8799903365', instagram: '' },
        itinerary: [{ day: 1, title: '', description: '' }],
        budgetBreakdown: [{ category: '', amount: 0 }]
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

    // Dynamic Array Handlers
    const addItineraryDay = () => setFormData(f => ({ ...f, itinerary: [...f.itinerary, { day: f.itinerary.length + 1, title: '', description: '' }] }));
    const removeItineraryDay = (index) => setFormData(f => ({ ...f, itinerary: f.itinerary.filter((_, i) => i !== index) }));
    const updateItinerary = (index, field, value) => {
        const newItin = [...formData.itinerary];
        newItin[index][field] = value;
        setFormData({ ...formData, itinerary: newItin });
    };

    const addBudgetRow = () => setFormData(f => ({ ...f, budgetBreakdown: [...f.budgetBreakdown, { category: '', amount: 0 }] }));
    const removeBudgetRow = (index) => setFormData(f => ({ ...f, budgetBreakdown: f.budgetBreakdown.filter((_, i) => i !== index) }));
    const updateBudget = (index, field, value) => {
        const newBudget = [...formData.budgetBreakdown];
        newBudget[index][field] = value;
        setFormData({ ...formData, budgetBreakdown: newBudget });
    };

    const handleTripSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const submitData = new FormData();

        submitData.append('title', formData.title);
        submitData.append('destination', formData.destination);
        submitData.append('dateDisplay', formData.dateDisplay);
        submitData.append('status', formData.status);
        submitData.append('section', formData.section);
        submitData.append('bookingFee', formData.bookingFee);
        submitData.append('totalSlots', formData.totalSlots);
        submitData.append('shortDescription', formData.shortDescription);
        submitData.append('overview', formData.overview);
        submitData.append('mapEmbedUrl', formData.mapEmbedUrl);

        // Convert comma separated to array
        const checklistArr = formData.checklist.split(',').map(s => s.trim()).filter(s => s);
        const galleryArr = formData.gallery.split(',').map(s => s.trim()).filter(s => s);

        submitData.append('checklist', JSON.stringify(checklistArr));
        submitData.append('gallery', JSON.stringify(galleryArr));

        submitData.append('itinerary', JSON.stringify(formData.itinerary));
        submitData.append('budgetBreakdown', JSON.stringify(formData.budgetBreakdown));
        submitData.append('tripLeader', JSON.stringify(formData.tripLeader));

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
            section: trip.section || 'Upcoming Trips',
            bookingFee: trip.bookingFee,
            totalSlots: trip.totalSlots,
            shortDescription: trip.shortDescription || '',
            overview: trip.overview || '',
            mapEmbedUrl: trip.mapEmbedUrl || '',
            checklist: trip.checklist ? trip.checklist.join(', ') : '',
            gallery: trip.gallery ? trip.gallery.join(', ') : '',
            tripLeader: trip.tripLeader || { name: 'Yash Diwate', phone: '8799903365', instagram: '' },
            itinerary: trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary : [{ day: 1, title: '', description: '' }],
            budgetBreakdown: trip.budgetBreakdown && trip.budgetBreakdown.length > 0 ? trip.budgetBreakdown : [{ category: '', amount: 0 }],
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
            title: '', destination: '', dateDisplay: '', status: 'Coming Soon', section: 'Upcoming Trips',
            bookingFee: 50, totalSlots: 20, shortDescription: '', overview: '', mapEmbedUrl: '',
            checklist: '', gallery: '', coverImage: null,
            tripLeader: { name: 'Yash Diwate', phone: '8799903365', instagram: '' },
            itinerary: [{ day: 1, title: '', description: '' }],
            budgetBreakdown: [{ category: '', amount: 0 }]
        });
        setIsEditing(false);
        setCurrentTripId(null);
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                {activeTab === 'menu' ? (
                    <button className="btn-back" onClick={onBack}>← Back to Main Dashboard</button>
                ) : (
                    <button className="btn-back" onClick={() => setActiveTab('menu')}>← Back to Trips Menu</button>
                )}
                <h2>Manage Trips & Bookings</h2>
            </div>

            {activeTab === 'menu' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem', marginBottom: '3rem' }}>
                    {/* Card 1: Hero Section */}
                    <div
                        onClick={() => setActiveTab('hero')}
                        style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', padding: '3rem 2rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transition: 'transform 0.3s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🖼️</div>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '0.8rem', fontWeight: '800' }}>Manage Hero Section</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>Update the main slider images and featured trips on the homepage.</p>
                    </div>

                    {/* Card 2: Trips */}
                    <div
                        onClick={() => setActiveTab('trips')}
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '3rem 2rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 10px 30px rgba(59,130,246,0.3)', transition: 'transform 0.3s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✈️</div>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '0.8rem', fontWeight: '800' }}>Add / Manage Trips</h3>
                        <p style={{ color: '#bfdbfe', lineHeight: '1.5' }}>Create new detailed trips, edit itineraries, and manage published grid.</p>
                        <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '50px', display: 'inline-block', fontSize: '1rem', fontWeight: 'bold' }}>
                            {trips.length} Active Trips
                        </div>
                    </div>

                    {/* Card 3: Registrations */}
                    <div
                        onClick={() => setActiveTab('registrations')}
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '3rem 2rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 10px 30px rgba(16,185,129,0.3)', transition: 'transform 0.3s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💳</div>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '0.8rem', fontWeight: '800' }}>View Registrations</h3>
                        <p style={{ color: '#a7f3d0', lineHeight: '1.5' }}>Check Razorpay bookings, payment statuses, and user details.</p>
                        <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '50px', display: 'inline-block', fontSize: '1rem', fontWeight: 'bold' }}>
                            {registrations.length} Total Bookings
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'hero' && (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '16px', marginTop: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🚧</div>
                    <h2 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '1rem' }}>Hero Slider Management</h2>
                    <p style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>This feature allows customizing the front-page Swiper slider. Coming soon in a later update!</p>
                </div>
            )}

            {activeTab === 'trips' && (
                <div className="trips-view">
                    <section className="form-section" style={{ maxWidth: '1000px' }}>
                        <h3>{isEditing ? 'Edit Trip' : 'Create New Trip'}</h3>
                        <form onSubmit={handleTripSubmit} className="memory-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                            {/* --- BASIC INFO --- */}
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <h4>1. Basic Information</h4>
                            </div>

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
                                    <option value="Completed">Completed (Shows External Gallery)</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Trip Section / Category</label>
                                <input type="text" value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} required placeholder="e.g. Upcoming Trips, Manifested Trips" />
                                <small style={{ color: '#64748b' }}>Groups trips together on the public page under this exact exact spelling.</small>
                            </div>
                            <div className="form-group">
                                <label>Advance Booking Fee (₹)</label>
                                <input type="number" value={formData.bookingFee} onChange={e => setFormData({ ...formData, bookingFee: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Total Available Slots</label>
                                <input type="number" value={formData.totalSlots} onChange={e => setFormData({ ...formData, totalSlots: e.target.value })} required />
                            </div>
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                                <label>Cover Image (Required for Slider & Card)</label>
                                <input type="file" accept="image/*" onChange={e => setFormData({ ...formData, coverImage: e.target.files[0] })} required={!isEditing} />
                            </div>

                            {/* --- CONTENT --- */}
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                                <h4>2. Detail Content</h4>
                            </div>

                            <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                                <label>Short Description (For Grid Cards)</label>
                                <textarea value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} rows="2" placeholder="Brief tagline..." />
                            </div>
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                                <label>Detailed Overview (For dedicated page)</label>
                                <textarea value={formData.overview} onChange={e => setFormData({ ...formData, overview: e.target.value })} rows="4" placeholder="Full rich description..." />
                            </div>
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                                <label>Google Maps Iframe URL</label>
                                <input type="text" value={formData.mapEmbedUrl} onChange={e => setFormData({ ...formData, mapEmbedUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." />
                            </div>
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                                <label>Checklist (Comma separated)</label>
                                <input type="text" value={formData.checklist} onChange={e => setFormData({ ...formData, checklist: e.target.value })} placeholder="Warm Clothes, ID Card, Water Bottle..." />
                            </div>
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1' }}>
                                <label>Gallery Image Links (Comma separated URLs for now)</label>
                                <input type="text" value={formData.gallery} onChange={e => setFormData({ ...formData, gallery: e.target.value })} placeholder="https://image1.jpg, https://image2.jpg..." />
                            </div>

                            {/* --- ITINERARY --- */}
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                                <h4>3. Interactive Itinerary</h4>
                                {formData.itinerary.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                                        <input type="number" value={item.day} onChange={e => updateItinerary(index, 'day', e.target.value)} style={{ width: '80px' }} placeholder="Day" />
                                        <input type="text" value={item.title} onChange={e => updateItinerary(index, 'title', e.target.value)} style={{ flex: 1 }} placeholder="Day Title (e.g. Arrival)" />
                                        <input type="text" value={item.description} onChange={e => updateItinerary(index, 'description', e.target.value)} style={{ flex: 2 }} placeholder="Day Description..." />
                                        <button type="button" onClick={() => removeItineraryDay(index)} style={{ padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>X</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addItineraryDay} style={{ padding: '8px 16px', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>+ Add Day</button>
                            </div>

                            {/* --- BUDGET --- */}
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                                <h4>4. Budget Breakdown</h4>
                                {formData.budgetBreakdown.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                        <input type="text" value={item.category} onChange={e => updateBudget(index, 'category', e.target.value)} style={{ flex: 1 }} placeholder="Category (e.g. Stay, Food)" />
                                        <input type="number" value={item.amount} onChange={e => updateBudget(index, 'amount', e.target.value)} style={{ flex: 1 }} placeholder="Amount (₹)" />
                                        <button type="button" onClick={() => removeBudgetRow(index)} style={{ padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>X</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addBudgetRow} style={{ padding: '8px 16px', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>+ Add Expense Category</button>
                            </div>

                            {/* --- TEAM LEADER --- */}
                            <div className="form-group full-width" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                                <h4>5. Trip Leader Details</h4>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input type="text" value={formData.tripLeader.name} onChange={e => setFormData({ ...formData, tripLeader: { ...formData.tripLeader, name: e.target.value } })} placeholder="Leader Name" style={{ flex: 1 }} />
                                    <input type="text" value={formData.tripLeader.phone} onChange={e => setFormData({ ...formData, tripLeader: { ...formData.tripLeader, phone: e.target.value } })} placeholder="Leader Phone" style={{ flex: 1 }} />
                                    <input type="text" value={formData.tripLeader.instagram} onChange={e => setFormData({ ...formData, tripLeader: { ...formData.tripLeader, instagram: e.target.value } })} placeholder="Leader Instagram URL" style={{ flex: 1 }} />
                                </div>
                            </div>

                            <div className="form-actions" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
                                <button type="submit" className="btn-submit" style={{ padding: '1rem 3rem', fontSize: '1.2rem', background: '#10b981' }}>{isEditing ? 'Save Massive Trip Updates' : 'Launch New Trip'}</button>
                                {isEditing && <button type="button" className="btn-cancel" onClick={resetTripForm} style={{ padding: '1rem 3rem', fontSize: '1.2rem', marginLeft: '1rem' }}>Cancel</button>}
                            </div>
                        </form>
                    </section>

                    <section className="list-section">
                        <h3>Published Trips</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
                            {trips.map(trip => (
                                <div key={trip._id} style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    {/* Card Header / Image Area */}
                                    <div style={{
                                        height: '160px',
                                        background: trip.coverImageUrl ? `url(${trip.coverImageUrl}) center/cover` : '#cbd5e1',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            padding: '4px 10px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold',
                                            background: trip.status === 'Booking Open' ? '#dcfce7' : trip.status === 'Completed' ? '#e0e7ff' : '#fef9c3',
                                            color: trip.status === 'Booking Open' ? '#166534' : trip.status === 'Completed' ? '#3730a3' : '#854d0e',
                                            border: '2px solid white',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}>
                                            {trip.status}
                                        </div>
                                    </div>

                                    {/* Card Content Area */}
                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>{trip.title}</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            📍 {trip.destination}
                                        </p>

                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            paddingTop: '1rem', marginTop: 'auto',
                                            borderTop: '1px dashed #cbd5e1', fontSize: '0.9rem'
                                        }}>
                                            <div>
                                                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Section</span>
                                                <strong style={{ color: '#334155' }}>{trip.section || 'Upcoming Trips'}</strong>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Booked</span>
                                                <strong style={{ color: '#3b82f6' }}>{trip.bookedSlots} / {trip.totalSlots}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0' }}>
                                        <button
                                            onClick={() => handleTripEdit(trip)}
                                            style={{ flex: 1, padding: '1rem', background: '#f8fafc', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.target.style.background = '#eff6ff'}
                                            onMouseOut={(e) => e.target.style.background = '#f8fafc'}
                                        >
                                            ✎ Edit Trip
                                        </button>
                                        <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                                        <button
                                            onClick={() => handleTripDelete(trip._id)}
                                            style={{ flex: 1, padding: '1rem', background: '#f8fafc', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                                            onMouseOut={(e) => e.target.style.background = '#f8fafc'}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {trips.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                                    No trips published yet. Create your first one above!
                                </div>
                            )}
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
