import React, { useState, useEffect } from 'react';

const AdminReviews = ({ onBack }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [orderChanged, setOrderChanged] = useState(false);

    // Drag and drop state
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/reviews');
            if (!res.ok) throw new Error('Failed to fetch video reviews');
            const data = await res.json();
            // Sort by order initially
            data.sort((a, b) => (a.order || 0) - (b.order || 0));
            setReviews(data);
            setLoading(false);
            setOrderChanged(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const extractYouTubeID = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Validate YouTube URL
        const ytId = extractYouTubeID(youtubeUrl);
        if (!ytId) {
            alert('Please enter a valid YouTube URL');
            return;
        }

        const payload = {
            name,
            role,
            youtubeUrl
        };

        // Automatically set order to the end if adding a new review
        if (!editingId) {
            const maxOrder = reviews.length > 0 ? Math.max(...reviews.map(r => r.order || 0)) : 0;
            payload.order = maxOrder + 1;
        }

        try {
            const url = editingId
                ? `http://localhost:5000/api/reviews/${editingId}`
                : 'http://localhost:5000/api/reviews';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save review');
            }

            resetForm();
            fetchReviews();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (review) => {
        setName(review.name);
        setRole(review.role);
        setYoutubeUrl(review.youtubeUrl);
        setEditingId(review._id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this video review?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchReviews();
        } catch (err) {
            alert(err.message);
        }
    };

    const resetForm = () => {
        setName('');
        setRole('');
        setYoutubeUrl('');
        setEditingId(null);
    };

    // --- Drag and Drop Logic ---
    const handleDragStart = (index, e) => {
        setDraggedItemIndex(index);
        // Required for Firefox
        if (e && e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.parentNode);
        }
    };

    const handleDragEnter = (index) => {
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const updatedReviews = [...reviews];
        const draggedItem = updatedReviews[draggedItemIndex];
        updatedReviews.splice(draggedItemIndex, 1);
        updatedReviews.splice(index, 0, draggedItem);

        // Update order property according to array index
        const updatedReviewsOrder = updatedReviews.map((r, i) => ({ ...r, order: i }));
        setReviews(updatedReviewsOrder);
        setDraggedItemIndex(index);
        setOrderChanged(true);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const saveOrder = async () => {
        const token = localStorage.getItem('token');
        try {
            const payload = reviews.map(r => ({ id: r._id, order: r.order }));
            const res = await fetch('http://localhost:5000/api/reviews/bulk/reorder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reviews: payload })
            });

            if (!res.ok) throw new Error('Failed to save order');
            alert('Order saved successfully!');
            setOrderChanged(false);
            fetchReviews();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button className="btn-back" onClick={onBack}>← Back to Menu</button>
                <h2>Manage Video Reviews</h2>
            </div>

            <section className="form-section">
                <h3>{editingId ? 'Edit Review' : 'Add New Video Review'}</h3>
                <form onSubmit={handleSubmit} className="memory-form">
                    <div className="form-group">
                        <label>Reviewer Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
                    </div>

                    <div className="form-group">
                        <label>Role / Title</label>
                        <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Alumni or Community Member" required />
                    </div>

                    <div className="form-group full-width">
                        <label>YouTube Video Link</label>
                        <input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required />
                        <small style={{ color: '#666', marginTop: '4px' }}>Provide a valid public or unlisted YouTube link. The video will be embedded on the site.</small>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit">
                            {editingId ? 'Update Review' : 'Add Review'}
                        </button>
                        {editingId && (
                            <button type="button" className="btn-cancel" onClick={resetForm}>
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="list-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                    <h3 style={{ border: 'none', margin: 0, padding: 0 }}>All Video Reviews</h3>
                    {orderChanged && (
                        <button
                            onClick={saveOrder}
                            style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Save New Order
                        </button>
                    )}
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Drag and drop rows to reorder them, then click "Save New Order".</p>

                <div className="memories-table-wrapper">
                    <table className="memories-table" style={{ userSelect: 'none' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>≡</th>
                                <th>Thumbnail</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading reviews...</td></tr> : error ? <tr><td colSpan="5" className="error">{error}</td></tr> : (
                                reviews.map((review, index) => {
                                    const ytId = extractYouTubeID(review.youtubeUrl);
                                    const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/default.jpg` : '';

                                    return (
                                        <tr
                                            key={review._id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(index, e)}
                                            onDragEnter={() => handleDragEnter(index)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => e.preventDefault()}
                                            style={{
                                                cursor: 'grab',
                                                opacity: draggedItemIndex === index ? 0.5 : 1,
                                                background: draggedItemIndex === index ? '#f3f4f6' : 'white',
                                                transition: 'background 0.2s ease, opacity 0.2s ease'
                                            }}
                                        >
                                            <td style={{ cursor: 'grab', color: '#9ca3af', fontSize: '1.2rem' }}>⣿</td>
                                            <td>
                                                {thumbUrl ? (
                                                    <img src={thumbUrl} alt="Thumbnail preview" className="thumb-img" style={{ width: '80px', height: '60px' }} />
                                                ) : (
                                                    <span style={{ color: 'red', fontSize: '0.8rem' }}>Invalid Link</span>
                                                )}
                                            </td>
                                            <td>{review.name}</td>
                                            <td>{review.role}</td>
                                            <td>
                                                <button onClick={() => handleEdit(review)} className="btn-action edit">Edit</button>
                                                <button onClick={() => handleDelete(review._id)} className="btn-action delete">Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminReviews;
