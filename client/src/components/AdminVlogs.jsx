import { useState, useEffect } from 'react';
import API_URL, { API_BASE_URL } from '../config';

const AdminVlogs = ({ onBack }) => {
    const [vlogs, setVlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        videoUrl: '',
        category: 'Trip',
        description: ''
    });

    useEffect(() => {
        fetchVlogs();
    }, []);

    const fetchVlogs = async () => {
        try {
            const res = await fetch(`${API_URL}/vlogs`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setVlogs(data);
            } else {
                setVlogs([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching vlogs:', err);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (vlog) => {
        setIsEditing(true);
        setEditId(vlog._id);
        setFormData({
            title: vlog.title,
            videoUrl: vlog.videoUrl,
            category: vlog.category,
            description: vlog.description || ''
        });
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ title: '', videoUrl: '', category: 'Trip', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isEditing ? `${API_URL}/vlogs/${editId}` : `${API_URL}/vlogs`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(isEditing ? 'Vlog Updated!' : 'Vlog Added!');
                cancelEdit(); // Resets form
                fetchVlogs();
            } else {
                alert('Failed to save vlog');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this vlog?')) return;
        try {
            await fetch(`${API_URL}/vlogs/${id}`, { method: 'DELETE' });
            fetchVlogs();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button onClick={onBack} className="btn-back">← Back to Dashboard</button>
                <h2>Manage Vlogs</h2>
            </div>

            <section className="form-section">
                <h3>{isEditing ? 'Edit Vlog' : 'Add New Vlog'}</h3>
                <form onSubmit={handleSubmit} className="memory-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>YouTube URL</label>
                        <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleChange} required placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="Trip">Trip</option>
                            <option value="Event">Event</option>
                            <option value="Fun">Fun</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description (1-2 lines)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief catchy description..."
                            rows="2"
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        {isEditing && (
                            <button type="button" className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                        )}
                        <button type="submit" className="btn-submit">
                            {isEditing ? 'Update Vlog' : 'Add Vlog'}
                        </button>
                    </div>
                </form>
            </section>

            <section className="list-section">
                <h3>Existing Vlogs ({vlogs.length})</h3>
                <div className="memories-table-wrapper">
                    <table className="memories-table">
                        <thead>
                            <tr>
                                <th>Thumbnail</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vlogs.map(vlog => (
                                <tr key={vlog._id}>
                                    <td>
                                        <img
                                            src={`https://img.youtube.com/vi/${vlog.youtubeId}/default.jpg`}
                                            alt="thumb"
                                            className="thumb-img"
                                        />
                                    </td>
                                    <td>{vlog.title}</td>
                                    <td>{vlog.category}</td>
                                    <td>
                                        <button className="btn-action edit" onClick={() => handleEdit(vlog)} style={{ marginRight: '10px' }}>Edit</button>
                                        <button className="btn-action delete" onClick={() => handleDelete(vlog._id)}>Delete</button>
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

export default AdminVlogs;
