import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';

const MemoriesTimeline = () => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const res = await fetch(`${API_URL}/memories`);
                const data = await res.json();

                // Add displayDate formatted
                const formattedData = data.map(memory => {
                    const dateObj = new Date(memory.date);
                    return {
                        ...memory,
                        displayDate: dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    };
                });

                setMemories(formattedData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching memories:', err);
                setLoading(false);
            }
        };

        fetchMemories();
    }, []);

    const observerRef = useRef(null);

    useEffect(() => {
        if (loading) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const handleIntersect = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        setTimeout(() => {
            const cards = document.querySelectorAll('.memory-card');
            cards.forEach(card => observer.observe(card));
        }, 100); // Small delay to ensure DOM is ready

        return () => {
            if (observer) {
                const cards = document.querySelectorAll('.memory-card');
                cards.forEach(card => observer.unobserve(card));
            }
        };
    }, [loading, memories]);

    return (
        <div className="memories-container">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;600&display=swap');

                    :root {
                        --deep-burgundy: #2c0e14;
                        --rich-maroon: #4a192c;
                        --soft-pink: #fce4ec;
                        --warm-gold: #ffd700;
                        --rose-gold: #e0bfb8;
                        --text-light: #fff0f5;
                        --card-bg: #fff;
                        --card-border: #f8f9fa;
                    }

                    .memories-container {
                        font-family: 'Outfit', sans-serif;
                        background: radial-gradient(circle at center, var(--rich-maroon), var(--deep-burgundy));
                        min-height: 100vh;
                        color: var(--text-light);
                        padding: 4rem 2rem;
                        position: relative;
                        overflow-x: hidden;
                    }

                    /* Floating Hearts Background */
                    .floating-heart {
                        position: absolute;
                        color: rgba(255, 255, 255, 0.05);
                        font-size: 2rem;
                        animation: floatUp 15s infinite linear;
                        z-index: 0;
                    }

                    @keyframes floatUp {
                        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                        10% { opacity: 0.3; }
                        90% { opacity: 0.3; }
                        100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
                    }

                    /* Header */
                    .memories-header {
                        text-align: center;
                        margin-bottom: 5rem;
                        position: relative;
                        z-index: 2;
                        animation: fadeInDown 1.5s ease-out;
                    }

                    .memories-title {
                        font-family: 'Great Vibes', cursive;
                        font-size: 5rem;
                        color: var(--warm-gold);
                        margin-bottom: 0.5rem;
                        text-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
                    }

                    .memories-subtitle {
                        font-family: 'Playfair Display', serif;
                        font-size: 1.5rem;
                        font-style: italic;
                        color: var(--rose-gold);
                        letter-spacing: 1px;
                    }

                    .btn-back {
                        display: inline-block;
                        margin-top: 2rem;
                        padding: 0.8rem 2rem;
                        border: 1px solid var(--warm-gold);
                        color: var(--warm-gold);
                        text-decoration: none;
                        border-radius: 50px;
                        transition: all 0.3s ease;
                        font-size: 0.9rem;
                    }

                    .btn-back:hover {
                        background: var(--warm-gold);
                        color: var(--deep-burgundy);
                        box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
                    }

                    /* Timeline */
                    .timeline {
                        position: relative;
                        max-width: 1000px;
                        margin: 0 auto;
                        padding: 2rem 0;
                        z-index: 2;
                    }

                    /* Golden Thread Line */
                    .timeline::after {
                        content: '';
                        position: absolute;
                        width: 2px;
                        background: linear-gradient(to bottom, transparent, var(--warm-gold), var(--rose-gold), transparent);
                        top: 0;
                        bottom: 0;
                        left: 50%;
                        margin-left: -1px;
                        box-shadow: 0 0 10px var(--warm-gold);
                    }

                    .memory-card {
                        padding: 10px 40px;
                        position: relative;
                        width: 50%;
                        box-sizing: border-box;
                        opacity: 0;
                        transform: translateY(50px);
                        transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    }

                    .memory-card.visible {
                        opacity: 1;
                        transform: translateY(0);
                    }

                    .left { left: 0; }
                    .right { left: 50%; }

                    /* Heart Icons on Line */
                    .memory-card::after {
                        content: '♥';
                        position: absolute;
                        width: 30px;
                        height: 30px;
                        background: var(--deep-burgundy);
                        border: 2px solid var(--warm-gold);
                        color: var(--warm-gold);
                        border-radius: 50%;
                        top: 25px;
                        z-index: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                    }

                    .left::after { right: -17px; }
                    .right::after { left: -17px; }

                    /* Polaroid Content */
                    .content {
                        background: var(--card-bg);
                        padding: 15px 15px 40px 15px; /* Extra bottom padding for caption like polaroid */
                        position: relative;
                        border-radius: 2px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        transform: rotate(-2deg);
                        transition: transform 0.3s ease;
                    }

                    .right .content { transform: rotate(2deg); }

                    .content:hover {
                        transform: rotate(0) scale(1.02);
                        z-index: 10;
                        box-shadow: 0 15px 40px rgba(0,0,0,0.5);
                    }

                    .memory-img {
                        width: 100%;
                        height: auto;
                        display: block;
                        border: 1px solid #ddd;
                        filter: sepia(0.2); 
                        transition: filter 0.3s ease;
                    }

                    .content:hover .memory-img {
                        filter: sepia(0);
                    }

                    .date-badge {
                        position: absolute;
                        top: -10px;
                        background: var(--warm-gold);
                        color: var(--deep-burgundy);
                        padding: 5px 15px;
                        font-size: 0.9rem;
                        font-weight: bold;
                        border-radius: 2px;
                        box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
                        z-index: 2;
                        font-family: 'Playfair Display', serif;
                    }

                    .left .date-badge { right: 10px; transform: rotate(3deg); }
                    .right .date-badge { left: 10px; transform: rotate(-3deg); }

                    .text-content {
                        margin-top: 15px;
                        color: #333;
                        text-align: center;
                    }

                    .memory-title {
                        font-family: 'Great Vibes', cursive;
                        font-size: 1.8rem;
                        color: #333;
                        margin: 0;
                        line-height: 1.2;
                    }

                    .memory-location {
                        font-size: 0.8rem;
                        color: #888;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-top: 5px;
                    }

                    .memory-caption {
                        font-family: 'Indie Flower', cursive; /* Handwritten style for caption */
                        font-size: 1rem;
                        color: #555;
                        margin-top: 10px;
                        line-height: 1.4;
                    }

                    /* Mobile Responsive via CSS Media Queries */
                    @media screen and (max-width: 768px) {
                        .memories-title { font-size: 3.5rem; }
                        .timeline::after { left: 31px; }
                        .memory-card { width: 100%; padding-left: 70px; padding-right: 25px; }
                        .left::after, .right::after { left: 15px; }
                        .left, .right { left: 0; }
                        .right .content { transform: rotate(-1deg); }
                    }

                    @keyframes fadeInDown {
                        from { opacity: 0; transform: translateY(-30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    .memories-footer {
                        text-align: center;
                        margin-top: 4rem;
                        font-family: 'Great Vibes', cursive;
                        font-size: 2rem;
                        color: rgba(255, 255, 255, 0.6);
                    }

                `}
            </style>

            {/* Floating Hearts */}
            <div className="floating-heart" style={{ left: '10%', animationDuration: '12s' }}>♥</div>
            <div className="floating-heart" style={{ left: '30%', animationDuration: '18s', animationDelay: '2s' }}>♥</div>
            <div className="floating-heart" style={{ left: '70%', animationDuration: '15s', animationDelay: '5s' }}>♥</div>
            <div className="floating-heart" style={{ left: '90%', animationDuration: '20s' }}>♥</div>

            <div className="memories-header">
                <h1 className="memories-title">GareebGang</h1>
                <p className="memories-subtitle">A collection of beautiful moments & endless laughter</p>
                <Link to="/" className="btn-back">← Back to Home</Link>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--warm-gold)' }}>
                    <div className="spinner" style={{
                        width: '40px', height: '40px', border: '4px solid rgba(255,215,0,0.3)',
                        borderTop: '4px solid var(--warm-gold)', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', margin: '0 auto 20px'
                    }}></div>
                    <p>Fetching memories...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : memories.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.5)' }}>
                    <p>No memories found. Login to Admin Dashboard to add some!</p>
                </div>
            ) : (
                <div className="timeline">
                    {memories.map((memory, index) => (
                        <div key={index} className={`memory-card ${index % 2 === 0 ? 'left' : 'right'}`}>
                            <div className="content">
                                <div className="date-badge">{memory.displayDate}</div>
                                <img src={memory.image} alt={memory.title} className="memory-img" loading="lazy" />
                                <div className="text-content">
                                    <h3 className="memory-title">{memory.title}</h3>
                                    <div className="memory-location">{memory.location}</div>
                                    <p className="memory-caption">{memory.caption}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="memories-footer">
                Friendship isn't a big thing, it's a million little things.
            </div>
        </div>
    );
};

export default MemoriesTimeline;
