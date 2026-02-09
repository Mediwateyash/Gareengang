import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API_URL, { API_BASE_URL } from '../config';

const MemoriesFeat = () => {
    const [images, setImages] = useState([
        "https://images.unsplash.com/photo-1566419806659-5b7967b57574?q=80&w=2699&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2669&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2669&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop"
    ]);

    useEffect(() => {
        const fetchBufferedMemories = async () => {
            try {
                const res = await fetch(`${API_URL}/memories`);
                const data = await res.json();

                if (data && data.length > 0) {
                    // Get latest 5 images for a better loop
                    const latestImages = data.slice(0, 5).map(m => getImageUrl(m.image));
                    // Ensure we have enough images for a smooth loop
                    while (latestImages.length < 5 && images.length > 0) {
                        latestImages.push(images[latestImages.length % images.length]);
                    }
                    setImages(latestImages);
                }
            } catch (error) {
                console.error("Error fetching featured memories:", error);
            }
        };

        fetchBufferedMemories();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    return (
        <section className="memories-feat-section">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Outfit:wght@300;400;600&display=swap');

                    .memories-feat-section {
                        /* Deep Space Theme to match Hero */
                        background: radial-gradient(circle at center, #1a1a2e 0%, #0f0c29 100%);
                        padding: 8rem 0;
                        position: relative;
                        overflow: hidden;
                        text-align: center;
                        color: #ffffff;
                    }

                    .feat-title {
                        font-family: 'Outfit', sans-serif;
                        font-size: 3.5rem;
                        font-weight: 700;
                        background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin-bottom: 1rem;
                        position: relative;
                        z-index: 2;
                        letter-spacing: -2px;
                    }

                    .feat-subtitle {
                        font-family: 'Great Vibes', cursive;
                        font-size: 2rem;
                        color: #ffd700;
                        margin-bottom: 4rem;
                        position: relative;
                        z-index: 2;
                        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                    }

                    /* Marquee Container */
                    .marquee-wrapper {
                        position: relative;
                        width: 100%;
                        overflow: hidden;
                        padding: 20px 0;
                        z-index: 2;
                        mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    }

                    .marquee-content {
                        display: flex;
                        gap: 30px;
                        width: max-content;
                        animation: scroll 30s linear infinite;
                    }

                    .marquee-wrapper:hover .marquee-content {
                        animation-play-state: paused;
                    }

                    @keyframes scroll {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }

                    /* Glass Cards */
                    .memory-card {
                        width: 300px;
                        height: 400px;
                        border-radius: 20px;
                        overflow: hidden;
                        position: relative;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        background: rgba(255, 255, 255, 0.05);
                        backdrop-filter: blur(10px);
                        transition: all 0.4s ease;
                        flex-shrink: 0;
                        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
                    }

                    .memory-card:hover {
                        transform: translateY(-10px) scale(1.02);
                        border-color: rgba(255, 215, 0, 0.5);
                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.2);
                    }

                    .memory-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.5s ease;
                    }

                    .memory-card:hover .memory-img {
                        transform: scale(1.1);
                    }

                    /* Explore Button */
                    .btn-explore {
                        margin-top: 4rem;
                        display: inline-block;
                        padding: 16px 48px;
                        background: transparent;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        color: #fff;
                        font-family: 'Outfit', sans-serif;
                        font-size: 1.1rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 3px;
                        border-radius: 4px;
                        text-decoration: none;
                        transition: all 0.3s ease;
                        position: relative;
                        z-index: 2;
                        overflow: hidden;
                    }

                    .btn-explore:hover {
                        background: white;
                        color: #000;
                        box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
                        letter-spacing: 5px;
                    }

                    /* Background Glows */
                    .glow-spot {
                        position: absolute;
                        width: 600px;
                        height: 600px;
                        border-radius: 50%;
                        filter: blur(80px);
                        opacity: 0.15;
                        z-index: 1;
                    }
                    .glow-1 { top: -200px; left: -200px; background: #4facfe; }
                    .glow-2 { bottom: -200px; right: -200px; background: #f093fb; }

                `}
            </style>

            <div className="glow-spot glow-1"></div>
            <div className="glow-spot glow-2"></div>

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <h2 className="feat-title">The Gallery</h2>
                <p className="feat-subtitle">Moments Frozen in Time</p>

                <div className="marquee-wrapper">
                    <div className="marquee-content">
                        {/* Render images twice for seamless loop */}
                        {[...images, ...images].map((src, index) => (
                            <div key={index} className="memory-card">
                                <img src={src} alt="Memory" className="memory-img" loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>

                <Link to="/memories" className="btn-explore">
                    View Full Timeline
                </Link>
            </div>
        </section>
    );
};

export default MemoriesFeat;
