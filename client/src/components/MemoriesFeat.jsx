import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API_URL from '../config';

const MemoriesFeat = () => {
    const [images, setImages] = useState([
        "https://images.unsplash.com/photo-1566419806659-5b7967b57574?q=80&w=2699&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2669&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2669&auto=format&fit=crop"
    ]);

    useEffect(() => {
        const fetchBufferedMemories = async () => {
            try {
                // Fetch latest 3 memories to show in preview
                const res = await fetch(`${API_URL}/memories`);
                const data = await res.json();

                if (data && data.length > 0) {
                    // Take first 3 images or fallback to data array length
                    const latestImages = data.slice(0, 3).map(m => m.image);
                    // Ensure we have at least 3 images by filling with fallbacks if needed
                    while (latestImages.length < 3 && images.length > 0) {
                        latestImages.push(images[latestImages.length]);
                    }
                    setImages(latestImages);
                }
            } catch (error) {
                console.error("Error fetching featured memories:", error);
            }
        };

        fetchBufferedMemories();
    }, []);

    return (
        <section className="memories-feat-section">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Outfit:wght@300;400;600&display=swap');

                    .memories-feat-section {
                        background: linear-gradient(to bottom, #050505, #2c0e14);
                        padding: 6rem 2rem;
                        position: relative;
                        overflow: hidden;
                        text-align: center;
                        color: #fff0f5;
                    }

                    .feat-title {
                        font-family: 'Great Vibes', cursive;
                        font-size: 4.5rem;
                        color: #ffd700;
                        margin-bottom: 0.5rem;
                        text-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
                        position: relative;
                        z-index: 2;
                    }

                    .feat-subtitle {
                        font-family: 'Outfit', sans-serif;
                        font-size: 1.2rem;
                        color: #e0bfb8;
                        margin-bottom: 3rem;
                        max-width: 600px;
                        margin-left: auto;
                        margin-right: auto;
                        position: relative;
                        z-index: 2;
                        letter-spacing: 1px;
                    }

                    .collage-container {
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        margin-bottom: 3rem;
                        perspective: 1000px;
                        position: relative;
                        z-index: 2;
                        flex-wrap: wrap;
                    }

                    .collage-img {
                        width: 250px;
                        height: 300px;
                        object-fit: cover;
                        border-radius: 10px;
                        border: 3px solid rgba(255, 255, 255, 0.1);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                        transition: all 0.5s ease;
                        filter: sepia(0.3);
                    }

                    .collage-img:nth-child(1) { transform: rotate(-5deg) translateY(20px); }
                    .collage-img:nth-child(2) { transform: rotate(0deg) scale(1.1); z-index: 3; }
                    .collage-img:nth-child(3) { transform: rotate(5deg) translateY(20px); }

                    .collage-container:hover .collage-img {
                        filter: sepia(0);
                        transform: rotate(0) scale(1.05);
                        margin: 0 10px;
                    }

                    .btn-explore {
                        display: inline-block;
                        padding: 15px 40px;
                        background: transparent;
                        border: 2px solid #ffd700;
                        color: #ffd700;
                        font-family: 'Outfit', sans-serif;
                        font-size: 1.1rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        border-radius: 50px;
                        text-decoration: none;
                        transition: all 0.3s ease;
                        position: relative;
                        z-index: 2;
                        overflow: hidden;
                    }

                    .btn-explore:hover {
                        background: #ffd700;
                        color: #2c0e14;
                        box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
                        transform: translateY(-3px);
                    }

                    /* Background Decor */
                    .feat-bg-blur {
                        position: absolute;
                        width: 400px;
                        height: 400px;
                        background: radial-gradient(circle, rgba(216, 27, 96, 0.2) 0%, transparent 70%);
                        border-radius: 50%;
                        z-index: 1;
                    }
                    .blur-1 { top: -100px; left: -100px; }
                    .blur-2 { bottom: -100px; right: -100px; background: radial-gradient(circle, rgba(255, 183, 77, 0.15) 0%, transparent 70%); }

                `}
            </style>

            <div className="feat-bg-blur blur-1"></div>
            <div className="feat-bg-blur blur-2"></div>

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <h2 className="feat-title">Cherished Moments</h2>
                <p className="feat-subtitle">
                    "We didn't realize we were making memories, we just knew we were having fun."
                </p>

                <div className="collage-container">
                    {images.map((src, index) => (
                        <img key={index} src={src} alt="Memory Preview" className="collage-img" />
                    ))}
                </div>

                <Link to="/memories" className="btn-explore">
                    Explore Timeline
                </Link>
            </div>
        </section>
    );
};

export default MemoriesFeat;
