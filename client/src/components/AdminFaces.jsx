import React, { useState, useEffect } from 'react';
import apiUrl, { API_BASE_URL } from '../config';

const AdminFaces = ({ onBack }) => {
    const [faces, setFaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [uniqueTrait, setUniqueTrait] = useState('');
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [orderChanged, setOrderChanged] = useState(false);

    // Drag and drop state
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    useEffect(() => {
        fetchFaces();
    }, []);

    const fetchFaces = async () => {
        try {
            const res = await fetch(`${apiUrl}/faces`);
            if (!res.ok) throw new Error('Failed to fetch faces');
            const data = await res.json();
            // Sort by order initially
            data.sort((a, b) => (a.order || 0) - (b.order || 0));
            setFaces(data);
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
        formData.append('name', name);
        formData.append('uniqueTrait', uniqueTrait);
        if (image) formData.append('image', image);

        // Automatically set order to the end if adding a new face
        if (!editingId) {
            const maxOrder = faces.length > 0 ? Math.max(...faces.map(f => f.order || 0)) : 0;
            formData.append('order', maxOrder + 1);
        }

        try {
            const url = editingId
                ? `${apiUrl}/faces/${editingId}`
                : `${apiUrl}/faces`;
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
                throw new Error(errorData.message || 'Failed to save face');
            }

            resetForm();
            fetchFaces();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (face) => {
        setName(face.name);
        setUniqueTrait(face.uniqueTrait);
        setEditingId(face._id);
        setImage(null);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this face?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/faces/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchFaces();
        } catch (err) {
            alert(err.message);
        }
    };

    const resetForm = () => {
        setName('');
        setUniqueTrait('');
        setImage(null);
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

        const updatedFaces = [...faces];
        const draggedItem = updatedFaces[draggedItemIndex];
        updatedFaces.splice(draggedItemIndex, 1);
        updatedFaces.splice(index, 0, draggedItem);

        // Update order property according to array index
        const updatedFacesOrder = updatedFaces.map((f, i) => ({ ...f, order: i }));
        setFaces(updatedFacesOrder);
        setDraggedItemIndex(index);
        setOrderChanged(true);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const saveOrder = async () => {
        const token = localStorage.getItem('token');
        try {
            const payload = faces.map(f => ({ id: f._id, order: f.order }));
            const res = await fetch(`${apiUrl}/faces/bulk/reorder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ faces: payload })
            });

            if (!res.ok) throw new Error('Failed to save order');
            alert('Order saved successfully!');
            setOrderChanged(false);
            fetchFaces();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button className="btn-back" onClick={onBack}>← Back to Menu</button>
                <h2>Manage Faces of GareebGang</h2>
            </div>

            <section className="form-section">
                <h3>{editingId ? 'Edit Face' : 'Add New Face'}</h3>
                <form onSubmit={handleSubmit} className="memory-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Unique Trait / Role</label>
                        <input type="text" value={uniqueTrait} onChange={(e) => setUniqueTrait(e.target.value)} required />
                    </div>

                    <div className="form-group full-width">
                        <label>Image (Upload new to replace)</label>
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required={!editingId} />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit">
                            {editingId ? 'Update Face' : 'Add Face'}
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
                    <h3 style={{ border: 'none', margin: 0, padding: 0 }}>All Faces</h3>
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
                                <th>Name</th>
                                <th>Trait / Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading faces...</td></tr> : error ? <tr><td colSpan="5" className="error">{error}</td></tr> : (
                                faces.map((face, index) => (
                                    <tr
                                        key={face._id}
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
                                            <img src={face.imageUrl.startsWith('http') ? face.imageUrl : `${API_BASE_URL}/${face.imageUrl}`} alt={face.name} className="thumb-img" />
                                        </td>
                                        <td>{face.name}</td>
                                        <td>{face.uniqueTrait}</td>
                                        <td>
                                            <button onClick={() => handleEdit(face)} className="btn-action edit">Edit</button>
                                            <button onClick={() => handleDelete(face._id)} className="btn-action delete">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminFaces;
