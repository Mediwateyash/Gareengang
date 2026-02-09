import { useState, useEffect } from 'react';
import API_URL, { API_BASE_URL } from '../config';

const AdminMemories = ({ onBack }) => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        location: '',
        caption: '',
        image: '',
        imageFile: null
    });
    const [preview, setPreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        try {
            const res = await fetch(`${API_URL}/memories`);
            const data = await res.json();
            setMemories(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching memories:', err);
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    const handleChange = (e) => {
        if (e.target.name === 'imageFile') {
            const file = e.target.files[0];
            setFormData({ ...formData, imageFile: file });
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditing ? `${API_URL}/memories/${editId}` : `${API_URL}/memories`;
            const method = isEditing ? 'PUT' : 'POST';

            const data = new FormData();
            data.append('title', formData.title);
            data.append('date', formData.date);
            data.append('location', formData.location);
            data.append('caption', formData.caption);
            if (formData.imageFile) data.append('imageFile', formData.imageFile);
            else if (formData.image) data.append('image', formData.image);

            const res = await fetch(url, { method, body: data });

            if (res.ok) {
                alert(isEditing ? 'Memory Updated!' : 'Memory Added!');
                resetForm();
                fetchMemories();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (err) {
            console.error('Error saving memory:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this memory?')) return;
        try {
            await fetch(`${API_URL}/memories/${id}`, { method: 'DELETE' });
            fetchMemories();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (memory) => {
        setFormData({
            title: memory.title,
            date: memory.date.split('T')[0],
            location: memory.location,
            caption: memory.caption,
            image: memory.image,
            imageFile: null
        });
        setPreview(getImageUrl(memory.image));
        setIsEditing(true);
        setEditId(memory._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ title: '', date: '', location: '', caption: '', image: '', imageFile: null });
        setPreview(null);
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button onClick={onBack} className="btn-back">← Back to Dashboard</button>
                <h2>Manage Memories</h2>
            </div>

            <section className="form-section">
                <h3>{isEditing ? 'Edit Memory' : 'Add New Memory'}</h3>
                <form onSubmit={handleSubmit} className="memory-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Image</label>
                        <input type="file" name="imageFile" accept="image/*" onChange={handleChange} />
                        <small>Or URL:</small>
                        <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" />
                        {preview && <img src={preview} alt="Preview" className="img-preview-small" />}
                    </div>
                    <div className="form-group full-width">
                        <label>Caption</label>
                        <textarea name="caption" value={formData.caption} onChange={handleChange} rows="2"></textarea>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-submit">{isEditing ? 'Update' : 'Add'}</button>
                        {isEditing && <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>}
                    </div>
                </form>
            </section>

            <section className="list-section">
                <h3>All Memories ({memories.length})</h3>
                <div className="memories-table-wrapper">
                    <table className="memories-table">
                        <thead>
                            <tr><th>Date</th><th>Image</th><th>Title</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {memories.map(m => (
                                <tr key={m._id}>
                                    <td>{new Date(m.date).toLocaleDateString()}</td>
                                    <td><img src={getImageUrl(m.image)} className="thumb-img" alt="" /></td>
                                    <td>{m.title}</td>
                                    <td>
                                        <button className="btn-action edit" onClick={() => handleEdit(m)}>Edit</button>
                                        <button className="btn-action delete" onClick={() => handleDelete(m._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminMemories;
