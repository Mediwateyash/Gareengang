import React, { useState, useEffect } from 'react';
import apiUrl from '../config';

const AdminSocials = ({ onBack }) => {
    const [socialLinks, setSocialLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [platform, setPlatform] = useState('Instagram');
    const [accountName, setAccountName] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [orderChanged, setOrderChanged] = useState(false);

    // Drag and drop state
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    useEffect(() => {
        fetchSocials();
    }, []);

    const fetchSocials = async () => {
        try {
            const res = await fetch(`${apiUrl}/socials`);
            if (!res.ok) throw new Error('Failed to fetch social links');
            const data = await res.json();
            // Sort by order initially
            data.sort((a, b) => (a.order || 0) - (b.order || 0));
            setSocialLinks(data);
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
        formData.append('platform', platform);
        formData.append('accountName', accountName);
        formData.append('url', url);
        if (file) {
            formData.append('imageFile', file);
        }

        // Automatically set order to the end if adding new
        if (!editingId) {
            const maxOrder = socialLinks.length > 0 ? Math.max(...socialLinks.map(s => s.order || 0)) : 0;
            formData.append('order', maxOrder + 1);
        }

        try {
            const endpoint = editingId
                ? `${apiUrl}/socials/${editingId}`
                : `${apiUrl}/socials`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save social link');
            }

            resetForm();
            fetchSocials();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (item) => {
        setPlatform(item.platform);
        setAccountName(item.accountName);
        setUrl(item.url);
        setFile(null); // Clear file input on edit
        setEditingId(item._id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this social link?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/socials/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchSocials();
        } catch (err) {
            alert(err.message);
        }
    };

    const resetForm = () => {
        setPlatform('Instagram');
        setAccountName('');
        setUrl('');
        setFile(null);
        setEditingId(null);
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

        const updatedItems = [...socialLinks];
        const draggedItem = updatedItems[draggedItemIndex];
        updatedItems.splice(draggedItemIndex, 1);
        updatedItems.splice(index, 0, draggedItem);

        // Update order property according to array index
        const updatedItemsOrder = updatedItems.map((item, i) => ({ ...item, order: i }));
        setSocialLinks(updatedItemsOrder);
        setDraggedItemIndex(index);
        setOrderChanged(true);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const saveOrder = async () => {
        const token = localStorage.getItem('token');
        try {
            const payload = socialLinks.map(s => ({ id: s._id, order: s.order }));
            const res = await fetch(`${apiUrl}/socials/bulk/reorder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ links: payload })
            });

            if (!res.ok) throw new Error('Failed to save order');
            alert('Order saved successfully!');
            setOrderChanged(false);
            fetchSocials();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button className="btn-back" onClick={onBack}>← Back to Menu</button>
                <h2>Manage Social Links</h2>
            </div>

            <section className="form-section">
                <h3>{editingId ? 'Edit Link' : 'Add New Link'}</h3>
                <form onSubmit={handleSubmit} className="memory-form">
                    <div className="form-group">
                        <label>Platform</label>
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="Instagram">Instagram</option>
                            <option value="YouTube">YouTube</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Other">Other / Website</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Display Name (e.g. "@gareebgang", "GG Vlogs")</label>
                        <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
                    </div>

                    <div className="form-group full-width">
                        <label>Full URL (e.g. "https://instagram.com/...")</label>
                        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
                    </div>

                    <div className="form-group full-width">
                        <label>Profile Image (Optional - overrides default icon)</label>
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                        {editingId && <small>Leave blank to keep current image/icon.</small>}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit">
                            {editingId ? 'Update Link' : 'Add Link'}
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
                    <h3 style={{ border: 'none', margin: 0, padding: 0 }}>Active Links</h3>
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
                                <th>Image</th>
                                <th>Platform</th>
                                <th>Account Name</th>
                                <th>URL</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading links...</td></tr> : error ? <tr><td colSpan="5" className="error">{error}</td></tr> : (
                                socialLinks.map((item, index) => {
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
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt="Profile" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                                                ) : (
                                                    <div style={{ width: '40px', height: '40px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Img</div>
                                                )}
                                            </td>
                                            <td>
                                                <strong style={{
                                                    color: item.platform === 'Instagram' ? '#e1306c' :
                                                        item.platform === 'YouTube' ? '#ff0000' :
                                                            item.platform === 'Facebook' ? '#1877f2' : '#2563eb'
                                                }}>{item.platform}</strong>
                                            </td>
                                            <td>{item.accountName}</td>
                                            <td><a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Test Link</a></td>
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

export default AdminSocials;
