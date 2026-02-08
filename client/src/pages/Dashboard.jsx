import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL, { API_BASE_URL } from '../config';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState('');
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        location: '',
        caption: '',
        image: '', // Keeps the URL if editing or manually entered
        imageFile: null // New state for file
    });
    const [preview, setPreview] = useState(null); // For image preview
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const loggedUser = localStorage.getItem('adminUser');
        if (!loggedUser) {
            navigate('/login');
        } else {
            setUser(loggedUser);
            fetchMemories();
        }
    }, [navigate]);

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

    const handleChange = (e) => {
        if (e.target.name === 'imageFile') {
            const file = e.target.files[0];
            setFormData({ ...formData, imageFile: file });
            // Create preview
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
            const url = isEditing
                ? `${API_URL}/memories/${editId}`
                : `${API_URL}/memories`;

            const method = isEditing ? 'PUT' : 'POST';

            // Create FormData object for file upload
            const data = new FormData();
            data.append('title', formData.title);
            data.append('date', formData.date);
            data.append('location', formData.location);
            data.append('caption', formData.caption);

            // If imageFile exists, append it. Otherwise send existing image URL if present
            if (formData.imageFile) {
                data.append('imageFile', formData.imageFile);
            } else if (formData.image) {
                data.append('image', formData.image);
            }

            const res = await fetch(url, {
                method: method,
                // Headers should NOT effectively set Content-Type for FormData, browser does it
                body: data
            });

            if (res.ok) {
                alert(isEditing ? 'Memory Updated!' : 'Memory Added!');
                setFormData({ title: '', date: '', location: '', caption: '', image: '', imageFile: null });
                setPreview(null);
                setIsEditing(false);
                setEditId(null);
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
        if (!window.confirm('Are you sure you want to delete this memory?')) return;

        try {
            await fetch(`${API_URL}/memories/${id}`, {
                method: 'DELETE'
            });
            fetchMemories();
        } catch (err) {
            console.error('Error deleting memory:', err);
        }
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

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        navigate('/login');
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </header>

            <main className="dashboard-content">

                {/* Form Section */}
                <section className="form-section">
                    <h2>{isEditing ? 'Edit Memory' : 'Add New Memory'}</h2>
                    <form onSubmit={handleSubmit} className="memory-form" encType="multipart/form-data">
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
                            <label>Upload Image</label>
                            <input type="file" name="imageFile" accept="image/*" onChange={handleChange} />
                            <small>Or paste URL below (optional)</small>
                            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Image URL (fallback)" />

                            {preview && (
                                <div style={{ marginTop: '10px' }}>
                                    <p>Preview:</p>
                                    <img src={preview} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '5px' }} />
                                </div>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label>Caption</label>
                            <textarea name="caption" value={formData.caption} onChange={handleChange} rows="3"></textarea>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit">
                                {isEditing ? 'Update Memory' : 'Adding...'}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn-cancel" onClick={() => {
                                    setIsEditing(false);
                                    setFormData({ title: '', date: '', location: '', caption: '', image: '', imageFile: null });
                                    setPreview(null);
                                }}>Cancel</button>
                            )}
                        </div>
                    </form>
                </section>

                {/* List Section */}
                <section className="list-section">
                    <h2>Manage Memories ({memories.length})</h2>
                    {loading ? <p>Loading...</p> : (
                        <div className="memories-table-wrapper">
                            <table className="memories-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Image</th>
                                        <th>Title</th>
                                        <th>Location</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memories.map(memory => (
                                        <tr key={memory._id}>
                                            <td>{new Date(memory.date).toLocaleDateString()}</td>
                                            <td>
                                                <img src={getImageUrl(memory.image)} alt="thumb" className="thumb-img" />
                                            </td>
                                            <td>{memory.title}</td>
                                            <td>{memory.location}</td>
                                            <td>
                                                <button className="btn-action edit" onClick={() => handleEdit(memory)}>Edit</button>
                                                <button className="btn-action delete" onClick={() => handleDelete(memory._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
