import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API_URL, { API_BASE_URL } from '../config';
import './MemoriesTimeline.css';

const MemberMemories = () => {
    const { name } = useParams();
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const fetchMemberMemories = async () => {
            try {
                const res = await fetch(`${API_URL}/memories`);
                const memData = await res.json();

                // Filter memories where the 'people' array includes the decoded name
                const decodedName = decodeURIComponent(name);
                const filtered = memData.filter(m =>
                    m.people && m.people.some(person => person.toLowerCase() === decodedName.toLowerCase())
                );

                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                setMemories(filtered);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchMemberMemories();
    }, [name]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    if (loading) return <div style={{ background: '#141414', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>Loading {decodeURIComponent(name)}'s Memories...</div>;

    return (
        <div className="memories-container">
            <div className="memories-header">
                <h1 className="memories-title">Adventures featuring {decodeURIComponent(name)}</h1>
                <p className="memories-subtitle">A collection of moments we shared together.</p>
                <Link to="/" className="btn-back-home">← Home</Link>
            </div>

            <div className="timeline-section" style={{ marginTop: '2rem' }}>
                <div className="timeline">
                    {memories.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#fff', fontSize: '1.2rem', padding: '2rem' }}>
                            We couldn't find any memories tagged with {decodeURIComponent(name)} yet.
                        </div>
                    ) : (
                        memories.slice(0, visibleCount).map((memory, index) => (
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
                        ))
                    )}
                    {visibleCount < memories.length && <div className="timeline-overlay-fade"></div>}
                </div>

                {visibleCount < memories.length && (
                    <div className="timeline-footer">
                        <button className="btn-load-more" onClick={handleLoadMore}>Load More ↓</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberMemories;
