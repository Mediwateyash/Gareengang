import { useState, useEffect } from 'react';
import API_URL from '../config';

const AdminCategories = ({ onBack }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/categories`);
            const data = await res.json();
            setCategories(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory })
            });

            if (res.ok) {
                const added = await res.json();
                setCategories([added, ...categories]);
                setNewCategory('');
            } else {
                alert('Error adding category');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
            setCategories(categories.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button onClick={onBack} className="btn-back">← Back</button>
                <h2>Manage Categories</h2>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New Category Name (e.g. Hiking)"
                        style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" className="btn-submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Add</button>
                </form>

                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {categories.map(cat => (
                        <li key={cat._id} style={{
                            background: 'white',
                            border: '1px solid #eee',
                            padding: '15px',
                            marginBottom: '10px',
                            borderRadius: '5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{cat.name}</span>
                            <button
                                onClick={() => handleDelete(cat._id)}
                                style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminCategories;
