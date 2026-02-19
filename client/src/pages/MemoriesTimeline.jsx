import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL, { API_BASE_URL } from '../config';
import './MemoriesTimeline.css';

const MemoriesTimeline = () => {
    const [memories, setMemories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(4);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memRes, catRes] = await Promise.all([
                    fetch(`${API_URL}/memories`),
                    fetch(`${API_URL}/categories`)
                ]);

                const memData = await memRes.json();
                memData.sort((a, b) => new Date(b.date) - new Date(a.date));
                setMemories(memData);

                if (catRes.ok) {
                    setCategories(await catRes.json());
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 4);
    };

    const getGroupedMemories = () => {
        // Use the populated memories from the category object itself (Admin "Playlist" order)
        const groups = categories
            .filter(cat => cat.memories && cat.memories.length > 0)
            .map(cat => ({
                name: cat.name,
                items: cat.memories
            }));

        return groups;
    };

    const groupedMemories = getGroupedMemories();

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    if (loading) return <div style={{ background: '#141414', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>Loading...</div>;

    return (
        <div className="memories-container">
            <div className="memories-header">
                <h1 className="memories-title">Our Journey</h1>
                <p className="memories-subtitle">A collection of moments worth remembering.</p>
                <Link to="/" className="btn-back-home">← Home</Link>
            </div>

            {/* 1. TIMELINE SECTION */}
            <div className="timeline-section">
                <div className="timeline">
                    {memories.slice(0, visibleCount).map((memory, index) => (
                        <div key={memory._id} className={`memory-card ${index % 2 === 0 ? 'card-left' : 'card-right'}`}>
                            <div className="timeline-content">
                                <img src={getImageUrl(memory.image)} alt={memory.title} className="timeline-img" loading="lazy" />
                                <div className="timeline-info">
                                    <h3 className="timeline-title">{memory.title}</h3>
                                    <div className="timeline-date">{new Date(memory.date).toLocaleDateString()}</div>
                                    <p className="timeline-desc">{memory.caption}</p>
                                    <Link to={`/memories/${memory._id}`} className="btn-dive">Dive In ➜</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Add fade overlay if there are more items */}
                    {visibleCount < memories.length && <div className="timeline-overlay-fade"></div>}
                </div>

                {visibleCount < memories.length && (
                    <div className="timeline-footer">
                        <button className="btn-load-more" onClick={handleLoadMore}>Continue Journey ↓</button>
                    </div>
                )}
            </div>

            {/* 2. NETFLIX-STYLE ROWS (Scrapbook Mode) */}
            <div className="category-rows">
                <h2 style={{ paddingLeft: '5px', marginBottom: '2rem', fontSize: '2.5rem', color: '#e74c3c', fontFamily: 'Permanent Marker' }}>Browse by Collection</h2>

                {groupedMemories.map((group) => (
                    <div key={group.name} className="category-row">
                        <div className="row-header">
                            <h3 className="row-title">{group.name}</h3>
                            <button className="btn-watch-all">Watch All ▶</button>
                        </div>
                        <div className="row-scroll-container">
                            {/* Render up to 10 items normally, then the 'See All' button */}
                            {group.items.slice(0, 10).map(m => (
                                <Link to={`/memories/${m._id}`} key={m._id} className="netflix-card">
                                    <div className="pin-tape"></div>
                                    <img src={getImageUrl(m.image)} alt={m.title} className="netflix-img" loading="lazy" />
                                    <div className="netflix-info">
                                        <div className="netflix-title">{m.title}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="scroll-hint-container">
                    <span className="scroll-hint-text">Scroll to see more ➔</span>
                </div>
            </div>
        </div>
    );
};

export default MemoriesTimeline;
