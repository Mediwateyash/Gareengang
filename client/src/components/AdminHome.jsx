import { useState, useEffect } from 'react';
import API_URL from '../config';

const AdminHome = ({ onBack }) => {
    const [memories, setMemories] = useState([]);
    const [vlogs, setVlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const [memRes, vlogRes] = await Promise.all([
                fetch(`${API_URL}/memories`),
                fetch(`${API_URL}/vlogs`)
            ]);

            const memData = await memRes.json();
            const vlogData = await vlogRes.json();

            setMemories(Array.isArray(memData) ? memData : []);
            setVlogs(Array.isArray(vlogData) ? vlogData : []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching content:", err);
            setLoading(false);
        }
    };

    const toggleFeaturedMemory = async (memory) => {
        try {
            const newFeatured = !memory.featured;
            // Default order to 1 if enabling, else keep existing or 0
            const newOrder = newFeatured ? (memory.featuredOrder || 1) : 0;

            const formData = new FormData();
            formData.append('featured', newFeatured);
            formData.append('featuredOrder', newOrder);

            const res = await fetch(`${API_URL}/memories/${memory._id}`, {
                method: 'PUT',
                body: formData
            });

            if (res.ok) fetchContent();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFeaturedVlog = async (vlog) => {
        try {
            const newFeatured = !vlog.featured;
            const newOrder = newFeatured ? (vlog.featuredOrder || 1) : 0;

            const res = await fetch(`${API_URL}/vlogs/${vlog._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    featured: newFeatured,
                    featuredOrder: newOrder
                })
            });

            if (res.ok) fetchContent();
        } catch (err) {
            console.error(err);
        }
    };

    const updateMemoryOrder = async (memory, order) => {
        try {
            const formData = new FormData();
            formData.append('featuredOrder', order);

            const res = await fetch(`${API_URL}/memories/${memory._id}`, {
                method: 'PUT',
                body: formData
            });
            if (res.ok) fetchContent();
        } catch (err) {
            console.error(err);
        }
    };

    const updateVlogOrder = async (vlog, order) => {
        try {
            await fetch(`${API_URL}/vlogs/${vlog._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featuredOrder: order })
            });
            fetchContent();
        } catch (err) {
            console.error(err);
        }
    };

    // Filter Featured vs Others
    const featuredMemories = memories.filter(m => m.featured).sort((a, b) => b.featuredOrder - a.featuredOrder);
    const otherMemories = memories.filter(m => !m.featured);

    const featuredVlogs = vlogs.filter(v => v.featured).sort((a, b) => b.featuredOrder - a.featuredOrder);
    const otherVlogs = vlogs.filter(v => !v.featured);

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button onClick={onBack} className="btn-back">← Back to Dashboard</button>
                <h2>Home Page Manager</h2>
            </div>

            <p style={{ marginBottom: '2rem', color: '#666' }}>
                Select up to 3 items to feature. Higher priority number = Shows first.
            </p>

            <div className="home-manager-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* --- MEMORIES SECTION --- */}
                <section className="manager-column">
                    <h3 style={{ borderBottom: '2px solid #e74c3c', paddingBottom: '10px' }}>Featured Memories (Max 3)</h3>

                    {/* Featured List */}
                    <div className="featured-list" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        {featuredMemories.length === 0 ? <p>No featured memories.</p> : featuredMemories.map(m => (
                            <div key={m._id} className="featured-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                                <span style={{ fontWeight: 'bold' }}>{m.title}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Priority:</label>
                                    <input
                                        type="number"
                                        value={m.featuredOrder}
                                        onChange={(e) => updateMemoryOrder(m, e.target.value)}
                                        style={{ width: '50px', padding: '2px' }}
                                    />
                                    <button onClick={() => toggleFeaturedMemory(m)} style={{ background: '#ff7675', border: 'none', color: 'white', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Available List */}
                    <h4>Available Memories</h4>
                    <div className="available-list" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
                        {otherMemories.map(m => (
                            <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                                <span>{m.title}</span>
                                <button onClick={() => toggleFeaturedMemory(m)} style={{ background: '#55efc4', border: 'none', color: '#333', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Feature</button>
                            </div>
                        ))}
                    </div>
                </section>


                {/* --- VLOGS SECTION --- */}
                <section className="manager-column">
                    <h3 style={{ borderBottom: '2px solid #0984e3', paddingBottom: '10px' }}>Featured Vlogs (Max 3)</h3>

                    {/* Featured List */}
                    <div className="featured-list" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        {featuredVlogs.length === 0 ? <p>No featured vlogs.</p> : featuredVlogs.map(v => (
                            <div key={v._id} className="featured-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                                <span style={{ fontWeight: 'bold' }}>{v.title}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Priority:</label>
                                    <input
                                        type="number"
                                        value={v.featuredOrder}
                                        onChange={(e) => updateVlogOrder(v, e.target.value)}
                                        style={{ width: '50px', padding: '2px' }}
                                    />
                                    <button onClick={() => toggleFeaturedVlog(v)} style={{ background: '#ff7675', border: 'none', color: 'white', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Available List */}
                    <h4>Available Vlogs</h4>
                    <div className="available-list" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
                        {otherVlogs.map(v => (
                            <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                                <span>{v.title}</span>
                                <button onClick={() => toggleFeaturedVlog(v)} style={{ background: '#74b9ff', border: 'none', color: '#fff', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Feature</button>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default AdminHome;
