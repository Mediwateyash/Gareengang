import { useState, useEffect, useRef } from 'react';
import API_URL, { API_BASE_URL } from '../config';

const AdminMemories = ({ onBack }) => {
    const [memories, setMemories] = useState([]);
    const [categories, setCategories] = useState([]); // Dynamic Categories
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '', date: '', location: '', category: 'Uncategorized', caption: '', image: '', imageFile: null,
        story: '', peopleText: '', relatedVlogUrl: '', galleryText: '', featured: false
    });
    // ... rest of state

    useEffect(() => {
        fetchMemories();
        fetchCategories(); // Fetch on load
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/categories`);
            if (res.ok) setCategories(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchMemories = async () => {
        try {
            const res = await fetch(`${API_URL}/memories`);
            const data = await res.json();
            // Sort by date desc
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setMemories(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching memories:', err);
            setLoading(false);
        }
    };

    const getImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/150';
        if (img.startsWith('http')) return img;
        return `${API_BASE_URL}${img}`;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, imageFile: file });
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this memory?')) return;
        try {
            const res = await fetch(`${API_URL}/memories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMemories(memories.filter(m => m._id !== id));
            } else {
                alert('Error deleting memory');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleGalleryFileChange = (e) => {
        setGalleryFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditing ? `${API_URL}/memories/${editId}` : `${API_URL}/memories`;
            const method = isEditing ? 'PUT' : 'POST';

            // Process Arrays
            const peopleArray = formData.peopleText.split(',').map(s => s.trim()).filter(Boolean);
            const galleryArray = formData.galleryText.split(',').map(s => s.trim()).filter(Boolean);

            const data = new FormData();
            data.append('title', formData.title);
            data.append('date', formData.date);
            data.append('location', formData.location);
            data.append('category', formData.category);
            data.append('caption', formData.caption);
            data.append('story', formData.story);
            data.append('relatedVlogUrl', formData.relatedVlogUrl);
            data.append('people', JSON.stringify(peopleArray));
            data.append('gallery', JSON.stringify(galleryArray));
            data.append('featured', formData.featured); // Add Featured

            if (formData.imageFile) data.append('imageFile', formData.imageFile);
            else if (formData.image) data.append('image', formData.image);

            // Append Gallery Files
            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => {
                    data.append('galleryFiles', file);
                });
            }

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



    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setGalleryFiles(prev => [...prev, ...files]);
        }
    };

    const removeGalleryFile = (index) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    };

    // ... (handleDelete)

    const handleEdit = (memory) => {
        setFormData({
            title: memory.title,
            date: memory.date.split('T')[0],
            location: memory.location,
            category: memory.category || 'Uncategorized',
            caption: memory.caption,
            image: memory.image,
            imageFile: null,
            story: memory.story || '',
            peopleText: memory.people ? memory.people.join(', ') : '',
            relatedVlogUrl: memory.relatedVlogUrl || '',
            galleryText: memory.gallery ? memory.gallery.map(g => typeof g === 'string' ? g : g.url).join(', ') : '',
            featured: memory.featured || false
        });
        setPreview(getImageUrl(memory.image));
        setIsEditing(true);
        setEditId(memory._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            title: '', date: '', location: '', category: 'Uncategorized', caption: '', image: '', imageFile: null,
            story: '', peopleText: '', relatedVlogUrl: '', galleryText: '', featured: false
        });
        setPreview(null);
        setIsEditing(false);
        setEditId(null);
        setGalleryFiles([]);
        setGalleryMethod('file');
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
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                            <option value="Uncategorized">Uncategorized</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>


                    <div className="form-group">
                        <label>Image Source</label>
                        <div className="radio-group" style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    checked={imageMethod === 'file'}
                                    onChange={() => setImageMethod('file')}
                                    style={{ marginRight: '8px' }}
                                />
                                Upload File
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    checked={imageMethod === 'url'}
                                    onChange={() => setImageMethod('url')}
                                    style={{ marginRight: '8px' }}
                                />
                                Direct Link (URL)
                            </label>
                        </div>

                        {imageMethod === 'file' ? (
                            <input type="file" name="imageFile" accept="image/*" onChange={handleImageChange} />
                        ) : (
                            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                        )}

                        {preview && (
                            <div style={{ marginTop: '10px' }}>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Preview:</p>
                                <img src={preview} alt="Preview" className="img-preview-small" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                        )}
                    </div>
                    <div className="form-group full-width">
                        <label>Caption (Short)</label>
                        <textarea name="caption" value={formData.caption} onChange={handleChange} rows="2"></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label>The Full Story (Detail Page)</label>
                        <textarea name="story" value={formData.story} onChange={handleChange} rows="5" placeholder="Write the full memory story here..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>People Involved (comma separated)</label>
                        <input type="text" name="peopleText" value={formData.peopleText} onChange={handleChange} placeholder="Yash, Manjush, Aditya" />
                    </div>

                    <div className="form-group">
                        <label>Related Vlog URL (YouTube)</label>
                        <input type="text" name="relatedVlogUrl" value={formData.relatedVlogUrl} onChange={handleChange} placeholder="https://youtube.com/..." />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff3cd', padding: '10px', borderRadius: '5px', border: '1px solid #ffeeba' }}>
                        <input
                            type="checkbox"
                            name="featured"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label style={{ margin: 0, fontWeight: 'bold', color: '#856404', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, featured: !formData.featured })}>
                            Feature this in "Our Best Moments" ?
                        </label>
                    </div>

                    <div className="form-group full-width">
                        <label>Gallery Images</label>
                        <div className="radio-group" style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    checked={galleryMethod === 'file'}
                                    onChange={() => setGalleryMethod('file')}
                                    style={{ marginRight: '8px' }}
                                />
                                Upload Files
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="radio"
                                    checked={galleryMethod === 'url'}
                                    onChange={() => setGalleryMethod('url')}
                                    style={{ marginRight: '8px' }}
                                />
                                Direct Links (URLs)
                            </label>
                        </div>

                        {galleryMethod === 'file' ? (
                            <div
                                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    border: isDragging ? '2px dashed #3498db' : '2px dashed #ccc',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    backgroundColor: isDragging ? 'rgba(52, 152, 219, 0.1)' : '#f9f9f9',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <p style={{ margin: 0, color: '#666' }}>
                                    {isDragging ? 'Drop images here...' : 'Drag & Drop photos here or Click to Select'}
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files.length > 0) {
                                            setGalleryFiles(prev => [...prev, ...Array.from(e.target.files)]);
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        ) : (
                            <textarea
                                name="galleryText"
                                value={formData.galleryText}
                                onChange={handleChange}
                                rows="3"
                                placeholder="http://img1.jpg, http://img2.jpg"
                            ></textarea>
                        )}
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                            {galleryMethod === 'file'
                                ? `${galleryFiles.length} files selected (Max 50)`
                                : 'Separate multiple URLs with commas'}
                        </small>

                        {/* Gallery Previews */}
                        {galleryFiles.length > 0 && galleryMethod === 'file' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                {galleryFiles.map((file, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`preview-${index}`}
                                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryFile(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            {Array.isArray(memories) && memories.length > 0 ? (
                                memories.map(m => (
                                    <tr key={m._id}>
                                        <td>{new Date(m.date).toLocaleDateString()}</td>
                                        <td>
                                            <img
                                                src={m.image ? getImageUrl(m.image) : 'https://via.placeholder.com/50'}
                                                className="thumb-img"
                                                alt=""
                                                onError={(e) => e.target.style.display = 'none'}
                                            />

                                        </td>
                                        <td>
                                            {m.title}
                                            {m.featured && <span style={{ marginLeft: '10px', fontSize: '1.2rem' }} title="Featured Memory">⭐</span>}
                                        </td>
                                        <td>
                                            <button className="btn-action view" onClick={() => window.open(`/memories/${m._id}`, '_blank')} style={{ marginRight: '5px', background: '#3498db' }}>View</button>
                                            <button className="btn-action edit" onClick={() => handleEdit(m)}>Edit</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(m._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {loading ? 'Loading memories...' : 'No memories found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminMemories;
