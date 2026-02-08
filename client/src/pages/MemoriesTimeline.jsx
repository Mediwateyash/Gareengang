import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const MemoriesTimeline = () => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/memories');
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
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

                    :root {
                        --warm-gold: #ffd700;
                        --rose-gold: #e0bfb8;
                        --deep-burgundy: #2c0e14;
                        --soft-pink: #fce4ec;
                        --text-primary: #fff0f5;
                        --text-secondary: #e6e6e6;
                        --card-bg: rgba(44, 14, 20, 0.7);
                        --card-border: rgba(255, 215, 0, 0.3);
                    }

                    * {
                        box-sizing: border-box;
                    }

                    .memories-container {
                        background-color: var(--deep-burgundy);
                        background-image: linear-gradient(to bottom, #2c0e14, #4a1c24, #2c0e14);
                        min-height: 100vh;
                        padding: 4rem 2rem;
                        font-family: 'Outfit', sans-serif;
                        color: var(--text-primary);
                        overflow-x: hidden;
                        position: relative;
                    }

                    /* Animated Background Elements - Soft Bokeh/Hearts */
                    .bg-shape {
                        position: absolute;
                        border-radius: 50%;
                        filter: blur(60px);
                        z-index: 0;
                        animation: float 15s infinite ease-in-out;
                        opacity: 0.4;
                    }
                    .shape-1 { width: 400px; height: 400px; background: #d81b60; top: -100px; left: -100px; animation-delay: 0s; }
                    .shape-2 { width: 500px; height: 500px; background: #880e4f; bottom: 10%; right: -150px; animation-delay: -5s; }
                    .shape-3 { width: 300px; height: 300px; background: #ffb74d; top: 40%; left: 20%; opacity: 0.2; animation-delay: -10s; }

                    /* Floating Hearts */
                    .floating-heart {
                        position: absolute;
                        color: rgba(255, 255, 255, 0.1);
                        font-size: 2rem;
                        animation: floatUp 10s linear infinite;
                        z-index: 0;
                    }

                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        50% { transform: translate(20px, -20px) scale(1.1); }
                    }

                    @keyframes floatUp {
                        0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
                        50% { opacity: 0.5; }
                        100% { transform: translateY(-10vh) scale(1); opacity: 0; }
                    }

                    .content-wrapper {
                        position: relative;
                        z-index: 10;
                    }

                    .memories-header {
                        text-align: center;
                        margin-bottom: 6rem;
                    }

                    .memories-title {
                        font-family: 'Great Vibes', cursive;
                        font-size: 5rem;
                        font-weight: 400;
                        color: var(--warm-gold);
                        margin-bottom: 0.5rem;
                        text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
                        line-height: 1.2;
                    }

                    .memories-subtitle {
                        font-family: 'Playfair Display', serif;
                        font-size: 1.3rem;
                        color: var(--rose-gold);
                        font-style: italic;
                        letter-spacing: 1px;
                        margin-bottom: 2rem;
                    }

                    .btn-back {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 25px;
                        border-radius: 30px;
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid var(--card-border);
                        color: var(--warm-gold);
                        text-decoration: none;
                        font-family: 'Outfit', sans-serif;
                        font-size: 0.9rem;
                        transition: all 0.3s ease;
                        backdrop-filter: blur(5px);
                    }

                    .btn-back:hover {
                        background: rgba(255, 215, 0, 0.1);
                        box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
                        transform: translateY(-2px);
                    }

                    .timeline {
                        position: relative;
                        max-width: 900px;
                        margin: 0 auto;
                        padding: 2rem 0;
                    }

                    /* The vertical line - Golden Thread */
                    .timeline::after {
                        content: '';
                        position: absolute;
                        width: 2px;
                        background: linear-gradient(to bottom, transparent, var(--warm-gold), var(--rose-gold), transparent);
                        top: 0;
                        bottom: 0;
                        left: 50%;
                        margin-left: -1px;
                        box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                    }

                    .memory-card-wrapper {
                        padding: 20px 40px;
                        position: relative;
                        width: 50%;
                        box-sizing: border-box;
                    }

                    .memory-card-wrapper.left { left: 0; text-align: right; }
                    .memory-card-wrapper.right { left: 50%; text-align: left; }

                    /* Timeline Dots - Hearts */
                    .timeline-dot {
                        position: absolute;
                        width: 24px;
                        height: 24px;
                        right: -52px;
                        background: var(--deep-burgundy);
                        border: 2px solid var(--warm-gold);
                        top: 32px;
                        border-radius: 50%; /* Or could be heart shape */
                        z-index: 2;
                        box-shadow: 0 0 10px var(--warm-gold);
                        transition: all 0.4s ease;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color: var(--warm-gold);
                        font-size: 12px;
                    }

                    .memory-card-wrapper.right .timeline-dot { left: -52px; right: auto; }

                    .memory-card-wrapper:hover .timeline-dot {
                        background: var(--warm-gold);
                        color: var(--deep-burgundy);
                        transform: scale(1.2);
                        box-shadow: 0 0 20px var(--warm-gold);
                    }

                    /* Timeline Connectors - Curved lines */
                    .timeline-connector {
                        position: absolute;
                        height: 1px;
                        width: 40px;
                        background: var(--warm-gold);
                        top: 44px;
                        right: -40px;
                        opacity: 0.4;
                        transition: all 0.3s;
                    }
                    .memory-card-wrapper.right .timeline-connector {
                        left: -40px;
                        right: auto;
                    }

                    .memory-card-wrapper:hover .timeline-connector {
                        opacity: 1;
                        width: 52px;
                    }

                    /* Card Styles - Polaroid Vibe */
                    .memory-card {
                        background: #fff; /* Polaroid white */
                        color: #333; /* Dark text for polaroid */
                        border-radius: 4px;
                        padding: 12px 12px 20px 12px; /* Polaroid padding */
                        position: relative;
                        overflow: hidden;
                        transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
                        opacity: 0;
                        transform: translateY(50px) rotate(-1deg);
                    }

                    .memory-card-wrapper.right .memory-card {
                        transform: translateY(50px) rotate(1deg);
                    }

                    .memory-card.visible {
                        opacity: 1;
                        transform: translateY(0) rotate(-1deg);
                    }
                    .memory-card-wrapper.right .memory-card.visible {
                        transform: translateY(0) rotate(1deg);
                    }

                    .memory-card:hover {
                        transform: translateY(-10px) rotate(0deg) scale(1.02) !important;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                        z-index: 10;
                    }

                    .card-image-container {
                        width: 100%;
                        height: 220px;
                        overflow: hidden;
                        position: relative;
                        background: #eee;
                        border: 1px solid #ddd;
                        margin-bottom: 1rem;
                    }

                    .card-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.8s ease;
                        filter: sepia(0.2); /* Nostalgic feel */
                    }

                    .memory-card:hover .card-image {
                        transform: scale(1.1);
                        filter: sepia(0);
                    }

                    .card-date-badge {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(255, 255, 255, 0.9);
                        color: #333;
                        font-family: 'Playfair Display', serif;
                        font-size: 0.8rem;
                        padding: 5px 10px;
                        border-radius: 2px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        z-index: 2;
                    }

                    .card-content {
                        padding: 0 0.5rem;
                        text-align: center; /* Center text for polaroid feel */
                    }

                    .card-title {
                        font-family: 'Great Vibes', cursive;
                        font-size: 2rem;
                        font-weight: 400;
                        color: #2c0e14;
                        margin: 0 0 0.5rem 0;
                        line-height: 1.1;
                    }

                    .card-location {
                        font-family: 'Outfit', sans-serif;
                        font-size: 0.8rem;
                        color: #888;
                        margin-bottom: 0.8rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 5px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }

                    .card-caption {
                        font-family: 'Playfair Display', serif;
                        font-size: 1rem;
                        line-height: 1.5;
                        color: #555;
                        font-style: italic;
                    }

                    .footer-text {
                        text-align: center;
                        margin-top: 8rem;
                        color: var(--rose-gold);
                        font-family: 'Great Vibes', cursive;
                        font-size: 1.5rem;
                        opacity: 0.8;
                    }

                    @media screen and (max-width: 768px) {
                        .memories-title { font-size: 3.5rem; }
                        .timeline::after { left: 30px; }
                        
                        .memory-card-wrapper {
                            width: 100%;
                            padding-left: 70px;
                            padding-right: 15px;
                            margin-bottom: 2rem;
                            text-align: left;
                        }
                        .memory-card-wrapper.left { text-align: left; }
                        
                        .timeline-dot, .memory-card-wrapper.right .timeline-dot {
                            left: 18px;
                            right: auto;
                        }
                        
                        .timeline-connector, .memory-card-wrapper.right .timeline-connector {
                            left: 30px;
                            right: auto;
                            width: 40px;
                        }
                        
                        .memory-card { transform: translateY(30px) rotate(0deg) !important; }
                        .memory-card.visible { transform: translateY(0) rotate(0deg) !important; }
                        
                        .card-content { text-align: left; }
                        .card-location { justify-content: flex-start; }
                    }
                `}
            </style>

            {/* Background Elements */}
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>
            {/* Some floating hearts */}
            <div className="floating-heart" style={{ left: '10%', animationDelay: '0s' }}>♥</div>
            <div className="floating-heart" style={{ left: '30%', animationDelay: '2s', fontSize: '1.5rem' }}>♡</div>
            <div className="floating-heart" style={{ left: '70%', animationDelay: '5s' }}>♥</div>
            <div className="floating-heart" style={{ left: '90%', animationDelay: '3s', fontSize: '1rem' }}>♡</div>

            <div className="content-wrapper">
                <div className="memories-header">
                    <h1 className="memories-title">GareebGang</h1>
                    <p className="memories-subtitle">A collection of beautiful moments & endless laughter</p>
                    <div style={{ marginTop: '2rem' }}>
                        <Link to="/dashboard" className="btn-back">
                            <span>←</span> Back to Home
                        </Link>
                    </div>
                </div>

                <div className="timeline">
                    {memories.map((memory, index) => (
                        <div key={index} className={`memory-card-wrapper ${index % 2 === 0 ? 'left' : 'right'}`}>
                            <div className="timeline-connector"></div>
                            <div className="timeline-dot">♥</div>
                            <div className="memory-card">
                                <div className="card-image-container">
                                    <img src={memory.image} alt={memory.title} className="card-image" />
                                    <div className="card-date-badge">{memory.displayDate}</div>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{memory.title}</h3>
                                    <p className="card-location">
                                        📍 {memory.location}
                                    </p>
                                    <p className="card-caption">"{memory.caption}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="footer-text">
                    <p>Friendship isn't a big thing, it's a million little things.</p>
                </div>
            </div>
        </div>
    );
};

export default MemoriesTimeline;
