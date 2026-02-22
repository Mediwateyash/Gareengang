import React, { useState, useEffect } from 'react';
const AdminFaces = ({ onBack }) => {
    const [faces, setFaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [uniqueTrait, setUniqueTrait] = useState('');
    const [image, setImage] = useState(null);
    const [order, setOrder] = useState(0);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchFaces();
    }, []);

    const fetchFaces = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/faces');
            if (!res.ok) throw new Error('Failed to fetch faces');
            const data = await res.json();
            setFaces(data);
            setLoading(false);
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
        formData.append('order', order);
        if (image) formData.append('image', image);

        try {
            const url = editingId
                ? `http://localhost:5000/api/faces/${editingId}`
                : 'http://localhost:5000/api/faces';

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

            // Reset form
            setName('');
            setUniqueTrait('');
            setImage(null);
            setOrder(0);
            setEditingId(null);

            // Refresh list
            fetchFaces();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (face) => {
        setName(face.name);
        setUniqueTrait(face.uniqueTrait);
        setOrder(face.order || 0);
        setEditingId(face._id);
        setImage(null);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this face?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/faces/${id}`, {
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

    return (
        <div className="admin-section">
            <button className="btn-back" onClick={onBack}>← Back to Menu</button>
            <h2>Manage Faces of GareebGang</h2>

            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Unique Trait / Role</label>
                    <input
                        type="text"
                        value={uniqueTrait}
                        onChange={(e) => setUniqueTrait(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Image (Upload new to replace)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        required={!editingId} // Required only if not editing
                    />
                </div>

                <div className="form-group">
                    <label>Sort Order (Lower = First)</label>
                    <input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save">
                        {editingId ? 'Update Face' : 'Add Face'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => {
                                setEditingId(null);
                                setName('');
                                setUniqueTrait('');
                                setImage(null);
                                setOrder(0);
                            }}
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            <div className="items-grid">
                {loading ? <p>Loading faces...</p> : error ? <p className="error">{error}</p> : (
                    faces.map(face => (
                        <div key={face._id} className="admin-item-card">
                            <img src={face.imageUrl.startsWith('http') ? face.imageUrl : `http://localhost:5000/${face.imageUrl}`} alt={face.name} className="item-thumb" />
                            <div className="item-info">
                                <h3>{face.name}</h3>
                                <p>{face.uniqueTrait}</p>
                            </div>
                            <div className="item-actions">
                                <button onClick={() => handleEdit(face)} className="btn-edit">Edit</button>
                                <button onClick={() => handleDelete(face._id)} className="btn-delete">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminFaces;
