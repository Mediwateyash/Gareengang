import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API_URL from '../config';

const MemoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [memory, setMemory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allMemories, setAllMemories] = useState([]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchMemory = async () => {
            try {
                const res = await fetch(`${API_URL}/memories/${id}`);
                const data = await res.json();
                setMemory(data);

                // Fetch all for navigation
                const allRes = await fetch(`${API_URL}/memories`);
                const allData = await allRes.json();
                // Sort same as timeline
                allData.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAllMemories(allData);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchMemory();
    }, [id]);

    if (loading) return <div className="loading-screen">Loading Memory... ⏳</div>;
    if (!memory) return <div className="error-screen">Memory not found 😕 <Link to="/memories">Go Back</Link></div>;

    // Navigation Logic
    const currentIndex = allMemories.findIndex(m => m._id === memory._id);
    const nextMemory = currentIndex > 0 ? allMemories[currentIndex - 1] : null; // Newer
    const prevMemory = currentIndex < allMemories.length - 1 ? allMemories[currentIndex + 1] : null; // Older

    // Helper for YouTube
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    const youtubeId = getYouTubeId(memory.relatedVlogUrl);

    return (
        <div className="memory-detail-page">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Patrick+Hand&family=Inter:wght@300;400;600&display=swap');

                    .memory-detail-page {
                        background-color: #fdfbf7;
                        background-image: url("https://www.transparenttextures.com/patterns/notebook-paper.png");
                        min-height: 100vh;
                        padding-bottom: 5rem;
                        font-family: 'Inter', sans-serif;
                    }

                    .memory-hero {
                        height: 80vh;
                        position: relative;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                        color: white;
                        text-align: center;
                    }
                    
                    .hero-bg {
                        position: absolute;
                        top: 0; left: 0; width: 100%; height: 100%;
                        background-size: cover;
                        background-position: center;
                        filter: brightness(0.6);
                        transform: scale(1.1);
                        z-index: 1;
                    }

                    .hero-content {
                        position: relative;
                        z-index: 2;
                        max-width: 800px;
                        padding: 2rem;
                        animation: fadeIn 1s ease-out;
                    }

                    .memory-title-lg {
                        font-family: 'Permanent Marker', cursive;
                        font-size: 4rem;
                        margin-bottom: 0.5rem;
                        text-shadow: 3px 3px 0 rgba(0,0,0,0.5);
                    }

                    .memory-meta {
                        font-size: 1.2rem;
                        font-weight: 300;
                        margin-bottom: 1.5rem;
                        font-family: 'Patrick Hand', cursive;
                        letter-spacing: 1px;
                        background: rgba(0,0,0,0.3);
                        display: inline-block;
                        padding: 5px 15px;
                        border-radius: 20px;
                    }

                    .memory-caption-lg {
                        font-family: 'Nanum Pen Script', cursive;
                        font-size: 2.2rem;
                        font-style: italic;
                        line-height: 1.4;
                        margin-top: 1rem;
                    }

                    .story-section {
                        max-width: 800px;
                        margin: -50px auto 4rem auto;
                        background: white;
                        padding: 3rem;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                        position: relative;
                        z-index: 3;
                        border-radius: 8px;
                        transform: rotate(-1deg);
                        background-image: linear-gradient(#f1f1f1 1px, transparent 1px);
                        background-size: 100% 2em;
                        line-height: 2em;
                    }
                    
                    .story-section::before {
                        content: '';
                        position: absolute;
                        top: -15px; left: 50%; transform: translateX(-50%);
                        width: 120px; height: 35px;
                        background: rgba(255, 235, 59, 0.7);
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }

                    .section-heading {
                        font-family: 'Patrick Hand', cursive;
                        color: #e74c3c;
                        font-size: 2.5rem;
                        margin-bottom: 1rem;
                        text-decoration: underline;
                        text-decoration-style: wavy;
                        border-bottom: none;
                    }

                    .story-text {
                        font-family: 'Nanum Pen Script', cursive;
                        font-size: 1.6rem;
                        color: #444;
                        white-space: pre-line;
                    }

                    .gallery-section {
                        max-width: 1000px;
                        margin: 4rem auto;
                        padding: 0 2rem;
                    }

                    .gallery-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1.5rem;
                    }

                    .gallery-item {
                        transition: transform 0.3s ease;
                        cursor: pointer;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        border: 5px solid white;
                        border-bottom-width: 25px;
                    }

                    .gallery-item:hover {
                        transform: scale(1.05) rotate(2deg);
                        z-index: 5;
                    }

                    .gallery-img {
                        width: 100%;
                        height: 250px;
                        object-fit: cover;
                    }

                    .info-grid {
                        max-width: 1000px;
                        margin: 0 auto 4rem auto;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 3rem;
                        padding: 0 2rem;
                    }

                    @media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } }

                    .info-card {
                        background: white;
                        padding: 2rem;
                        border-radius: 12px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                    }

                    .people-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.8rem;
                    }

                    .person-chip {
                        background: #eef2f3;
                        padding: 0.5rem 1rem;
                        border-radius: 50px;
                        font-family: 'Patrick Hand', cursive;
                        font-size: 1.2rem;
                        color: #333;
                    }

                    .vlog-section {
                        max-width: 800px;
                        margin: 0 auto 5rem auto;
                        padding: 0 1rem;
                        text-align: center;
                    }

                    .video-wrapper {
                        position: relative;
                        padding-bottom: 56.25%;
                        height: 0;
                        background: black;
                        border-radius: 15px;
                        overflow: hidden;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        border: 8px solid #fff;
                    }

                    .video-wrapper iframe {
                        position: absolute;
                        top: 0; left: 0; width: 100%; height: 100%;
                    }

                    .reactions-bar {
                        display: flex;
                        justify-content: center;
                        gap: 2rem;
                        margin-bottom: 4rem;
                    }

                    .reaction-btn {
                        background: white;
                        border: 2px solid #eee;
                        border-radius: 50%;
                        width: 60px; height: 60px;
                        font-size: 1.5rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        position: relative;
                    }

                    .reaction-btn:hover {
                        transform: scale(1.1);
                        border-color: #ff7675;
                    }
                    
                    .reaction-count {
                        font-size: 0.8rem;
                        font-family: sans-serif;
                        color: #888;
                        margin-top: 2px;
                    }

                    .nav-footer {
                        position: fixed;
                        bottom: 2rem;
                        left: 50%;
                        transform: translateX(-50%);
                        display: flex;
                        gap: 1.5rem;
                        z-index: 100;
                        background: rgba(255,255,255,0.9);
                        padding: 10px 20px;
                        border-radius: 30px;
                        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                        backdrop-filter: blur(5px);
                    }
                    
                    .nav-btn {
                        text-decoration: none;
                        color: #333;
                        font-weight: 600;
                        font-size: 0.9rem;
                    }
                    
                    .nav-btn:hover { color: #e74c3c; }

                    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                `}
            </style>

            {/* A) HERO */}
            <header className="memory-hero">
                <div className="hero-bg" style={{ backgroundImage: `url('${memory.image.startsWith('http') ? memory.image : API_URL.replace('/api', '') + memory.image}')` }}></div>
                <div className="hero-content">
                    <h1 className="memory-title-lg">{memory.title}</h1>
                    <div className="memory-meta">
                        {new Date(memory.date).toLocaleDateString()} • {memory.location}
                    </div>
                    <p className="memory-caption-lg">
                        "{memory.caption || 'Unforgettable moments...'}"
                    </p>
                </div>
            </header>

            {/* B) STORY */}
            <section className="story-section">
                <h2 className="section-heading">The Story</h2>
                <div className="story-text">
                    {memory.story || "This memory is just missing its words, but the pictures say it all! (Add a story in Admin Panel)"}
                </div>
            </section>

            {/* D) PEOPLE & HIGHLIGHTS */}
            <section className="info-grid">
                <div className="info-card">
                    <h3 className="section-heading" style={{ fontSize: '1.8rem' }}>The Squad</h3>
                    <div className="people-list">
                        {memory.people && memory.people.length > 0 ? (
                            memory.people.map((person, i) => (
                                <span key={i} className="person-chip">{person}</span>
                            ))
                        ) : (
                            <p style={{ fontStyle: 'italic', color: '#999' }}>The usual suspects.</p>
                        )}
                    </div>
                </div>

                <div className="info-card">
                    <h3 className="section-heading" style={{ fontSize: '1.8rem' }}>Highlights</h3>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem', fontFamily: 'Patrick Hand' }}>
                        {memory.highlights && memory.highlights.length > 0 ? memory.highlights.map((h, i) => (
                            <li key={i}><strong>{h.title}:</strong> {h.description}</li>
                        )) : (
                            <>
                                <li>😂 <strong>Funniest:</strong> That one joke Yash cracked.</li>
                                <li>🍕 <strong>Food:</strong> Absolutely delicious.</li>
                            </>
                        )}
                    </ul>
                </div>
            </section>

            {/* C) GALLERY */}
            {memory.gallery && memory.gallery.length > 0 && (
                <section className="gallery-section">
                    <h2 className="section-heading" style={{ textAlign: 'center' }}>Photo Dump</h2>
                    <div className="gallery-grid">
                        {memory.gallery.map((img, i) => (
                            <div key={i} className="gallery-item" onClick={() => window.open(img, '_blank')}>
                                <img src={img} alt="" className="gallery-img" />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* E) VLOG */}
            {youtubeId && (
                <section className="vlog-section">
                    <h2 className="section-heading">Watch the VLOG</h2>
                    <div className="video-wrapper">
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </section>
            )}

            {/* G) REACTIONS (Dummy for UI) */}
            <section className="reactions-bar">
                <button className="reaction-btn">❤️ <span className="reaction-count">12</span></button>
                <button className="reaction-btn">😂 <span className="reaction-count">5</span></button>
                <button className="reaction-btn">🔥 <span className="reaction-count">8</span></button>
            </section>

            {/* H) NAV FOOTER */}
            <div className="nav-footer">
                {prevMemory ? <Link to={`/memories/${prevMemory._id}`} className="nav-btn">← {prevMemory.title}</Link> : <span style={{ opacity: 0.5 }}>← Previous</span>}
                <Link to="/memories" className="nav-btn" style={{ borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc', padding: '0 15px' }}>All Memories</Link>
                {nextMemory ? <Link to={`/memories/${nextMemory._id}`} className="nav-btn">{nextMemory.title} →</Link> : <span style={{ opacity: 0.5 }}>Next →</span>}
            </div>
        </div>
    );
};

export default MemoryDetail;
