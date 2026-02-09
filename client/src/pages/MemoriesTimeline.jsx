import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL, { API_BASE_URL } from '../config';
import './MemoriesTimeline.css';

const MemoriesTimeline = () => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const res = await fetch(`${API_URL}/memories`);
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                const data = await res.json();

                const formattedData = data.map(memory => {
                    const dateObj = new Date(memory.date);
                    return {
                        ...memory,
                        displayDate: dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    };
                });

                // Sort by date descending
                formattedData.sort((a, b) => new Date(b.date) - new Date(a.date));

                setMemories(formattedData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching memories:', err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchMemories();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    return (
        <div className="memories-container">
            {/* Background Doodles & Text */}
            <div className="bg-doodle" style={{ top: '15%', left: '5%', transform: 'rotate(-15deg)' }}>✈️ Fly High!</div>
            <div className="bg-doodle" style={{ top: '25%', right: '8%', transform: 'rotate(10deg)', color: '#ff7675' }}>Pure Chaos 💥</div>
            <div className="bg-doodle" style={{ top: '45%', left: '10%', transform: 'rotate(-5deg)', fontSize: '1.5rem', color: '#6c5ce7' }}>Unforgettable 💖</div>
            <div className="bg-doodle" style={{ top: '60%', right: '5%', transform: 'rotate(15deg)' }}>Road trippin' 🚗</div>
            <div className="bg-doodle" style={{ top: '80%', left: '8%', transform: 'rotate(-10deg)', color: '#00b894' }}>Epic Moments 📸</div>

            {/* More Scribbles */}
            <div className="bg-doodle" style={{ top: '10%', right: '20%', transform: 'rotate(5deg)', fontSize: '1.2rem', opacity: 0.1 }}>cannot believe we did this...</div>
            <div className="bg-doodle" style={{ top: '35%', left: '15%', transform: 'rotate(-8deg)', fontSize: '2.5rem', opacity: 0.15 }}>LOL 😂</div>
            <div className="bg-doodle" style={{ top: '50%', right: '12%', transform: 'rotate(12deg)', fontSize: '1.2rem', border: '1px solid #333', padding: '2px 8px', borderRadius: '50% 20% / 10% 40%', opacity: 0.2 }}>Date?</div>
            <div className="bg-doodle" style={{ top: '70%', left: '20%', transform: 'rotate(-3deg)', fontSize: '1.5rem', color: '#fdcb6e' }}>✨✨✨</div>
            <div className="bg-doodle" style={{ top: '90%', right: '15%', transform: 'rotate(8deg)', fontFamily: 'Permanent Marker', opacity: 0.1 }}>BEST DAY EVER</div>
            <div className="bg-doodle" style={{ top: '5%', left: '30%', transform: 'rotate(20deg)', fontSize: '1rem', borderBottom: '2px wavy #ff7675' }}>Wild & Free</div>

            <div className="memories-header">
                <h1 className="memories-title">Our Journey</h1>
                <p className="memories-subtitle">Every picture tells a story...</p>
                <Link to="/" className="btn-back-home">← Back to Home</Link>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.5rem', fontFamily: 'Permanent Marker' }}>
                    Parsing Memories... ⏳
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', color: '#e74c3c' }}>Error: {error}</div>
            ) : memories.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#888' }}>
                    <p>No memories found. Start adding some!</p>
                </div>
            ) : (
                <div className="timeline">
                    {memories.map((memory, index) => (
                        <div key={memory._id} className={`memory-card ${index % 2 === 0 ? 'card-left' : 'card-right'}`}>
                            <div className="polaroid-content">
                                <img src={getImageUrl(memory.image)} alt={memory.title} className="memory-img" loading="lazy" />
                                <div className="text-content">
                                    <h3 className="memory-title">{memory.title}</h3>
                                    <div className="memory-date">{memory.displayDate}</div>
                                    <div className="memory-location">📍 {memory.location}</div>
                                    <p className="memory-caption">{memory.caption}</p>
                                    <button className="btn-view-memory">
                                        Dive into Memory ➜
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemoriesTimeline;
