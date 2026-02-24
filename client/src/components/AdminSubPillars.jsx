import React, { useState, useEffect } from 'react';
import apiUrl, { API_BASE_URL } from '../config';

const AdminSubPillars = ({ onBack }) => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [pillarTarget, setPillarTarget] = useState('President');
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [orderChanged, setOrderChanged] = useState(false);

    // Drag and drop state
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await fetch(`${apiUrl}/subpillars`);
            if (!res.ok) throw new Error('Failed to fetch media');
            const data = await res.json();
            // Sort by order initially
            data.sort((a, b) => (a.order || 0) - (b.order || 0));
            setMediaItems(data);
            setLoading(false);
            setOrderChanged(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('pillarTarget', pillarTarget);
        formData.append('caption', caption);
        if (file) formData.append('mediaFile', file);

        // Automatically set order to the end if adding new
        if (!editingId) {
            const maxOrder = mediaItems.length > 0 ? Math.max(...mediaItems.map(m => m.order || 0)) : 0;
            formData.append('order', maxOrder + 1);
        }

        try {
            const url = editingId
                ? `${apiUrl}/subpillars/${editingId}`
                : `${apiUrl}/subpillars`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save media');
            }

            resetForm();
            fetchMedia();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (item) => {
        setPillarTarget(item.pillarTarget);
        setCaption(item.caption);
        setEditingId(item._id);
        setFile(null); // File is optional on edit
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this media?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/subpillars/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchMedia();
        } catch (err) {
            alert(err.message);
        }
    };

    const resetForm = () => {
        setPillarTarget('President');
        setCaption('');
        setFile(null);
        setEditingId(null);
        // Clear file input
        const fileInput = document.getElementById('mediaFileInput');
        if (fileInput) fileInput.value = '';
    };

    // --- Drag and Drop Logic ---
    const handleDragStart = (index, e) => {
        setDraggedItemIndex(index);
        if (e && e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.parentNode);
        }
    };

    const handleDragEnter = (index) => {
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const updatedItems = [...mediaItems];
        const draggedItem = updatedItems[draggedItemIndex];
        updatedItems.splice(draggedItemIndex, 1);
        updatedItems.splice(index, 0, draggedItem);

        // Update order property according to array index
        const updatedItemsOrder = updatedItems.map((item, i) => ({ ...item, order: i }));
        setMediaItems(updatedItemsOrder);
        setDraggedItemIndex(index);
        setOrderChanged(true);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const saveOrder = async () => {
        const token = localStorage.getItem('token');
        try {
            const payload = mediaItems.map(m => ({ id: m._id, order: m.order }));
            const res = await fetch(`${apiUrl}/subpillars/bulk/reorder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ media: payload })
            });

            if (!res.ok) throw new Error('Failed to save order');
            alert('Order saved successfully!');
            setOrderChanged(false);
            fetchMedia();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button className="btn-back" onClick={onBack}>← Back to Menu</button>
                <h2>Manage Pillar Action Moments</h2>
            </div>

            <section className="form-section">
                <h3>{editingId ? 'Edit Media' : 'Add New Media'}</h3>
                <form onSubmit={handleSubmit} className="memory-form">
                    <div className="form-group">
                        <label>Target Pillar</label>
                        <select
                            value={pillarTarget}
                            onChange={(e) => setPillarTarget(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="President">President (Diwate Yash)</option>
                            <option value="VP">Vice President (Manjush Farad)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Caption (e.g. "Collecting Tickets", "Serving Food")</label>
                        <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} required />
                    </div>

                    <div className="form-group full-width">
                        <label>Upload Photo or Video (Max 15MB)</label>
                        <input
                            id="mediaFileInput"
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={(e) => setFile(e.target.files[0])}
                            required={!editingId}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit">
                            {editingId ? 'Update Media' : 'Add Media'}
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
                    <h3 style={{ border: 'none', margin: 0, padding: 0 }}>All Action Moments</h3>
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
                                <th>Preview</th>
                                <th>Pillar</th>
                                <th>Caption</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading media...</td></tr> : error ? <tr><td colSpan="6" className="error">{error}</td></tr> : (
                                mediaItems.map((item, index) => {
                                    const mediaSrc = item.mediaUrl.startsWith('http') ? item.mediaUrl : `${API_BASE_URL}/${item.mediaUrl}`;

                                    return (
                                        <tr
                                            key={item._id}
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
                                                {item.mediaType === 'video' ? (
                                                    <video src={mediaSrc} className="thumb-img" style={{ height: '60px', width: 'auto', background: 'black' }} muted />
                                                ) : (
                                                    <img src={mediaSrc} alt={item.caption} className="thumb-img" />
                                                )}
                                            </td>
                                            <td><strong style={{ color: item.pillarTarget === 'President' ? '#2563eb' : '#059669' }}>{item.pillarTarget}</strong></td>
                                            <td>{item.caption}</td>
                                            <td>{item.mediaType.toUpperCase()}</td>
                                            <td>
                                                <button onClick={() => handleEdit(item)} className="btn-action edit">Edit</button>
                                                <button onClick={() => handleDelete(item._id)} className="btn-action delete">Delete</button>
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

export default AdminSubPillars;
