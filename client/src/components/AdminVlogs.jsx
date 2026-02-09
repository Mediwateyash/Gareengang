import { useState, useEffect } from 'react';
import API_URL, { API_BASE_URL } from '../config';

const AdminVlogs = ({ onBack }) => {
    const [vlogs, setVlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        videoUrl: '',
        category: 'Trip'
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

    const extractYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const youtubeId = extractYoutubeId(formData.videoUrl);

        if (!youtubeId) {
            alert('Invalid YouTube URL');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/vlogs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, youtubeId })
            });

            if (res.ok) {
                alert('Vlog Added!');
                setFormData({ title: '', videoUrl: '', category: 'Trip' });
                fetchVlogs();
            } else {
                alert('Failed to add vlog');
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
                <h3>Add New Vlog</h3>
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
                    <div className="form-actions">
                        <button type="submit" className="btn-submit">Add Vlog</button>
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
