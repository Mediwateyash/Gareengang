import { useState, useEffect } from 'react';
import API_URL from '../config';

const AdminCategories = ({ onBack }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [allMemories, setAllMemories] = useState([]); // Pool of memories to add
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [catRes, memRes] = await Promise.all([
                fetch(`${API_URL}/categories`),
                fetch(`${API_URL}/memories`)
            ]);

            const cats = await catRes.json();
            const mems = await memRes.json();

            setCategories(cats);
            setAllMemories(mems);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setLoading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            const newCat = await res.json();
            console.log('New Category Created:', newCat); // Debug Log
            // Refresh data to ensure full consistency
            fetchData();
            setNewCategoryName('');
        } catch (err) { console.error(err); }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
            setCategories(categories.filter(c => c._id !== id));
            if (selectedCategory && selectedCategory._id === id) setSelectedCategory(null);
        } catch (err) { console.error(err); }
    };

    const handleAddMemoryToCategory = async (memoryId) => {
        if (!selectedCategory) return;
        // Prevent duplicates
        const currentMemories = selectedCategory.memories || [];
        if (currentMemories.find(m => m._id === memoryId)) return;

        const updatedMemories = [...currentMemories.map(m => m._id), memoryId];
        await updateCategoryMemories(selectedCategory._id, updatedMemories);
        setIsAddModalOpen(false); // Close modal 
    };

    const handleRemoveMemory = async (memoryId) => {
        if (!selectedCategory) return;
        const currentMemories = selectedCategory.memories || [];
        const updatedMemories = currentMemories.filter(m => m._id !== memoryId).map(m => m._id);
        await updateCategoryMemories(selectedCategory._id, updatedMemories);
    };

    const handleMoveOrder = async (index, direction) => {
        if (!selectedCategory) return;
        const items = [...(selectedCategory.memories || [])];
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= items.length) return;

        // Swap
        [items[index], items[targetIndex]] = [items[targetIndex], items[index]];

        // Optimistic UI update combined with selected category update
        const newSelectedCategory = { ...selectedCategory, memories: items };
        setSelectedCategory(newSelectedCategory);

        // Update main list optimistically as well
        setCategories(categories.map(c => c._id === selectedCategory._id ? newSelectedCategory : c));

        // API Update
        await updateCategoryMemories(selectedCategory._id, items.map(m => m._id));
    };

    const updateCategoryMemories = async (catId, memoryIds) => {
        try {
            const res = await fetch(`${API_URL}/categories/${catId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memories: memoryIds })
            });
            if (res.ok) {
                const updatedCat = await res.json();
                // Update list
                setCategories(categories.map(c => c._id === catId ? updatedCat : c));
                setSelectedCategory(updatedCat);
            }
        } catch (err) { console.error(err); }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/50';
        if (url.startsWith('http')) return url;
        return `${API_URL.replace('/api', '')}${url}`;
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button onClick={onBack} className="btn-back">← Back</button>
                <h2>Manage Collections ({categories.length})</h2>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {/* Left: Category List */}
                <div style={{ width: '30%', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <form onSubmit={handleCreateCategory} style={{ display: 'flex', marginBottom: '15px' }}>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New Collection Name"
                            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px 0 0 4px' }}
                        />
                        <button type="submit" style={{ padding: '8px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>+</button>
                    </form>

                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {categories.map(cat => (
                            <li key={cat._id}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    padding: '10px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    background: selectedCategory?._id === cat._id ? '#e8f0fe' : 'transparent',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                            >
                                <span>{cat.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right: Selected Category Editor */}
                <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '500px' }}>
                    {selectedCategory ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                <h3>Editing: {selectedCategory.name}</h3>
                                <button onClick={() => setIsAddModalOpen(true)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ Add Memories</button>
                            </div>

                            {selectedCategory.memories && selectedCategory.memories.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {selectedCategory.memories.map((mem, index) => (
                                        <li key={mem._id} style={{
                                            display: 'flex', alignItems: 'center', gap: '15px',
                                            padding: '10px', border: '1px solid #eee', marginBottom: '8px', borderRadius: '4px',
                                            background: '#f9f9f9', justifyContent: 'space-between'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <span style={{ fontWeight: 'bold', color: '#888', minWidth: '30px' }}>#{index + 1}</span>
                                                <img src={getImageUrl(mem.image)} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                                <div>{mem.title}</div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                {/* Reorder Buttons */}
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    <button
                                                        disabled={index === 0}
                                                        onClick={() => handleMoveOrder(index, -1)}
                                                        style={{ cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '5px', opacity: index === 0 ? 0.3 : 1 }}
                                                        title="Move Up"
                                                    >⬆️</button>
                                                    <button
                                                        disabled={index === selectedCategory.memories.length - 1}
                                                        onClick={() => handleMoveOrder(index, 1)}
                                                        style={{ cursor: index === selectedCategory.memories.length - 1 ? 'not-allowed' : 'pointer', padding: '5px', opacity: index === selectedCategory.memories.length - 1 ? 0.3 : 1 }}
                                                        title="Move Down"
                                                    >⬇️</button>
                                                </div>

                                                <button onClick={() => handleRemoveMemory(mem._id)} style={{ color: 'red', border: '1px solid red', background: 'white', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', marginLeft: '10px' }}>Remove</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <p style={{ color: '#888', fontStyle: 'italic', marginBottom: '20px' }}>No memories in this collection yet.</p>
                                    <button onClick={() => setIsAddModalOpen(true)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Click to Add Memories</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: '#aaa' }}>
                            Select a collection on the left to edit.
                        </div>
                    )}
                </div>
            </div>

            {/* Add Memory Modal */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', width: '500px', maxHeight: '80vh', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <h3>Add to "{selectedCategory?.name}"</h3>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, maxHeight: '60vh' }}>
                            {(!allMemories || allMemories.length === 0) && <p>No memories available.</p>}
                            {Array.isArray(allMemories) && allMemories.map(m => {
                                const isAlreadyIn = (selectedCategory?.memories || []).some(inCat => inCat._id === m._id);
                                if (isAlreadyIn) return null; // Hide already added

                                return (
                                    <div key={m._id} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '10px', borderBottom: '1px solid #eee'
                                    }}>
                                        <img src={getImageUrl(m.image)} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold' }}>{m.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(m.date).toLocaleDateString()}</div>
                                        </div>
                                        <button
                                            onClick={() => handleAddMemoryToCategory(m._id)}
                                            style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
