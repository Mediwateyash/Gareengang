import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API_URL from '../config';

const MemoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [memory, setMemory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allMemories, setAllMemories] = useState([]);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');

    const handleLike = async (e, index) => {
        e.stopPropagation();
        const item = memory.gallery[index];
        // If it's a string (legacy), we can't like it yet (or needs migration). 
        // Backend handles migration on next save, but for now let's safely check _id.
        if (!item._id) return;

        try {
            const res = await fetch(`${API_URL}/memories/${memory._id}/gallery/${item._id}/like`, { method: 'POST' });
            if (res.ok) {
                // Optimistic UI update
                const newGallery = [...memory.gallery];
                newGallery[index] = { ...newGallery[index], likes: (newGallery[index].likes || 0) + 1 };
                setMemory({ ...memory, gallery: newGallery });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const item = memory.gallery[currentImageIndex];
        if (!item._id || !commentText.trim()) return;

        try {
            const res = await fetch(`${API_URL}/memories/${memory._id}/gallery/${item._id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentText })
            });

            if (res.ok) {
                const updatedMemory = await res.json();
                setMemory(updatedMemory); // Full update to ensure sync
                setCommentText('');
            }
        } catch (err) {
            console.error(err);
        }
    };

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

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightboxOpen, memory]); // Added dependency on memory for next/prevImage

    if (loading) return <div className="loading-screen">Loading Memory... ⏳</div>;
    if (!memory) return <div className="error-screen">Memory not found 😕 <Link to="/memories">Go Back</Link></div>;

    // Navigation Logic
    const currentIndex = allMemories.findIndex(m => m._id === memory._id);
    const nextMemory = currentIndex > 0 ? allMemories[currentIndex - 1] : null; // Newer
    const prevMemory = currentIndex < allMemories.length - 1 ? allMemories[currentIndex + 1] : null; // Older

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    const nextImage = (e) => {
        e?.stopPropagation();
        if (memory.gallery && memory.gallery.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % memory.gallery.length);
        }
    };

    const prevImage = (e) => {
        e?.stopPropagation();
        if (memory.gallery && memory.gallery.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + memory.gallery.length) % memory.gallery.length);
        }
    };

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

                    /* Lightbox Styles */
                    .lightbox-overlay {
                        position: fixed;
                        inset: 0;
                        width: 100vw;
                        height: 100vh;
                        background: rgba(0,0,0,0.95);
                        z-index: 99999;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        animation: fadeIn 0.3s ease;
                        backdrop-filter: blur(5px);
                    }

                    .lightbox-content-wrapper {
                        display: flex;
                        width: 90vw;
                        height: 85vh;
                        background: black;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 0 30px rgba(0,0,0,0.5);
                    }

                    /* Left Side: Image */
                    .lightbox-image-section {
                        flex: 1;
                        background: black;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                    }

                    .lightbox-img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }

                    /* Right Side: Comments */
                    .lightbox-sidebar {
                        width: 350px;
                        background: #fff;
                        display: flex;
                        flex-direction: column;
                        border-left: 1px solid #333;
                    }

                    .sidebar-header {
                        padding: 1rem;
                        border-bottom: 1px solid #eee;
                        font-family: 'Patrick Hand', cursive;
                        font-size: 1.5rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .comments-list {
                        flex: 1;
                        overflow-y: auto;
                        padding: 1rem;
                        background: #fdfbf7;
                    }

                    .comment-bubble {
                        background: white;
                        padding: 10px;
                        border-radius: 10px;
                        margin-bottom: 10px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                        font-family: 'Inter', sans-serif;
                        font-size: 0.9rem;
                    }

                    .comment-form {
                        padding: 1rem;
                        border-top: 1px solid #eee;
                        background: white;
                        display: flex;
                        gap: 10px;
                    }
                    
                    .comment-input {
                        flex: 1;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 20px;
                        outline: none;
                    }

                    .comment-submit {
                        background: #ff7675;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 20px;
                        cursor: pointer;
                        font-family: 'Patrick Hand', cursive;
                    }

                    .lightbox-close {
                        position: absolute;
                        top: 10px;
                        right: 15px;
                        background: none;
                        border: none;
                        color: white;
                        font-size: 2.5rem;
                        cursor: pointer;
                        z-index: 1001;
                    }
                    .lightbox-close:hover { color: #ff7675; }

                    .lightbox-nav {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        background: rgba(255,255,255,0.1);
                        border: none;
                        color: white;
                        font-size: 2rem;
                        padding: 10px;
                        cursor: pointer;
                        border-radius: 5px;
                        z-index: 1001;
                    }
                    .lightbox-nav:hover { background: rgba(255,255,255,0.3); }
                    .lightbox-prev { left: 10px; }
                    .lightbox-next { right: 10px; }

                    /* Grid Overlays */
                    .gallery-item { position: relative; }
                    .gallery-overlay {
                        position: absolute;
                        bottom: 0; left: 0; width: 100%;
                        padding: 10px;
                        background: linear-gradient(transparent, rgba(0,0,0,0.7));
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px;
                        opacity: 0;
                        transition: opacity 0.3s;
                    }
                    .gallery-item:hover .gallery-overlay { opacity: 1; }

                    .overlay-btn {
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 5px 10px;
                        border-radius: 15px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    .overlay-btn:hover { background: rgba(255,255,255,0.4); }

                    @media (max-width: 768px) {
                        .lightbox-content-wrapper { flex-direction: column; height: 90vh; }
                        .lightbox-sidebar { width: 100%; height: 40%; }
                        .lightbox-image-section { height: 60%; }
                    }
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
                        {memory.gallery.map((item, i) => {
                            const isObj = typeof item === 'object';
                            const src = isObj ? item.url : item;
                            const likes = isObj ? (item.likes || 0) : 0;
                            const comments = isObj ? (item.comments?.length || 0) : 0;

                            return (
                                <div key={i} className="gallery-item" onClick={() => openLightbox(i)}>
                                    <img src={src} alt="" className="gallery-img" />
                                    <div className="gallery-overlay">
                                        <button className="overlay-btn" onClick={(e) => handleLike(e, i)}>
                                            ❤️ {likes}
                                        </button>
                                        <button className="overlay-btn">
                                            💬 {comments}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
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

            {/* I) LIGHTBOX OVERLAY */}
            {lightboxOpen && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox}>&times;</button>

                    <div className="lightbox-content-wrapper" onClick={(e) => e.stopPropagation()}>
                        {/* LEFT: IMAGE */}
                        <div className="lightbox-image-section">
                            <button className="lightbox-nav lightbox-prev" onClick={prevImage}>&#10094;</button>
                            <img
                                src={typeof memory.gallery[currentImageIndex] === 'object' ? memory.gallery[currentImageIndex].url : memory.gallery[currentImageIndex]}
                                alt="Gallery"
                                className="lightbox-img"
                            />
                            <button className="lightbox-nav lightbox-next" onClick={nextImage}>&#10095;</button>
                        </div>

                        {/* RIGHT: COMMENTS */}
                        <div className="lightbox-sidebar">
                            <div className="sidebar-header">
                                <span>Comments</span>
                                <span style={{ fontSize: '0.9rem', color: '#ff7675' }}>
                                    ❤️ {typeof memory.gallery[currentImageIndex] === 'object' ? (memory.gallery[currentImageIndex].likes || 0) : 0} Likes
                                </span>
                            </div>

                            <div className="comments-list">
                                {typeof memory.gallery[currentImageIndex] === 'object' && memory.gallery[currentImageIndex].comments?.length > 0 ? (
                                    memory.gallery[currentImageIndex].comments.map((c, idx) => (
                                        <div key={idx} className="comment-bubble">
                                            {c.text}
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>No comments yet. Be the first!</p>
                                )}
                            </div>

                            <form className="comment-form" onSubmit={handleCommentSubmit}>
                                <input
                                    type="text"
                                    className="comment-input"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button type="submit" className="comment-submit">Send</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemoryDetail;
