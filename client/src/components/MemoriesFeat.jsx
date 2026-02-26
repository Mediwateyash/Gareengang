import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API_URL, { API_BASE_URL } from '../config';

const MemoriesFeat = () => {
    const navigate = useNavigate();
    const [memories, setMemories] = useState([]);

    useEffect(() => {
        const fetchLatestMemories = async () => {
            try {
                // Fetch only featured memories
                const res = await fetch(`${API_URL}/memories/featured`);
                const data = await res.json();
                if (data && data.length > 0) {
                    setMemories(data);
                }
            } catch (error) {
                console.error("Error fetching featured memories:", error);
            }
        };

        fetchLatestMemories();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    const handleProtectedNavigation = (path) => {
        const user = localStorage.getItem('user');
        if (!user) {
            alert("Please login or create an account to view these memories.");
            navigate('/login');
        } else {
            navigate(path);
        }
    };

    return (
        <section className="memories-feat-section">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Nanum+Pen+Script&display=swap');

                    .memories-feat-section {
                        /* Scrapbook texture */
                        background: #fdfbf7;
                        background-image: url("https://www.transparenttextures.com/patterns/notebook-paper.png");
                        padding: 8rem 0;
                        position: relative;
                        overflow: hidden;
                        text-align: center;
                        color: #333;
                    }

                    .feat-title {
                        font-family: 'Permanent Marker', cursive;
                        font-size: 3.5rem;
                        color: #e74c3c;
                        margin-bottom: 1rem;
                        transform: rotate(-1deg);
                        text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
                        z-index: 2;
                        position: relative;
                    }

                    .feat-subtitle {
                        font-family: 'Nanum Pen Script', cursive;
                        font-size: 2rem;
                        color: #555;
                        margin-bottom: 4rem;
                        z-index: 2;
                        position: relative;
                    }

                    /* Scrapbook Layout */
                    .collage-container {
                        display: flex;
                        justify-content: center;
                        gap: 2rem;
                        flex-wrap: wrap;
                        perspective: 1000px;
                        padding-bottom: 3rem;
                    }

                    .scrap-card {
                        background: white;
                        padding: 10px 10px 40px 10px;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                        width: 280px;
                        height: 340px;
                        position: relative;
                        transition: all 0.4s ease;
                        cursor: pointer;
                        text-decoration: none;
                        color: inherit;
                        display: block;
                    }

                    .scrap-card::before {
                        content: '';
                        position: absolute;
                        top: -10px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 80px;
                        height: 25px;
                        background: rgba(255, 235, 59, 0.5); /* Yellow Tape */
                        z-index: 5;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }

                    /* Rotations for randomness */
                    .scrap-card:nth-child(1) { transform: rotate(-3deg) translateY(20px); }
                    .scrap-card:nth-child(2) { transform: rotate(2deg) translateY(-10px); z-index: 2; }
                    .scrap-card:nth-child(3) { transform: rotate(-4deg) translateY(10px); }

                    .scrap-card:hover {
                        transform: scale(1.05) rotate(0deg) !important;
                        z-index: 10;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    }

                    .scrap-img {
                        width: 100%;
                        height: 85%; /* Leave space for caption */
                        object-fit: cover;
                        filter: sepia(0.2);
                        transition: filter 0.3s;
                    }

                    .scrap-card:hover .scrap-img {
                        filter: sepia(0);
                    }
                    
                    .scrap-caption {
                        font-family: 'nanum pen script';
                        font-size: 1.5rem;
                        margin-top: 5px;
                        line-height: 1;
                    }

                    .btn-explore {
                        font-family: 'Patrick Hand', cursive;
                        font-size: 1.5rem;
                        color: #2c3e50;
                        text-decoration: none;
                        border-bottom: 3px dashed #e74c3c;
                        padding-bottom: 5px;
                        transition: all 0.3s ease;
                    }

                    .btn-explore:hover {
                        color: #e74c3c;
                        border-bottom-style: solid;
                    }

                `}
            </style>

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <h2 className="feat-title">Our Best Moments</h2>
                <p className="feat-subtitle">
                    "We didn't realize we were making memories, we just knew we were having fun."
                </p>

                <div className="collage-container">
                    {memories.length > 0 ? (
                        memories.map((m) => (
                            <div key={m._id} onClick={() => handleProtectedNavigation(`/memories/${m._id}`)} className="scrap-card" style={{ cursor: 'pointer' }}>
                                <img src={getImageUrl(m.image)} alt={m.title} className="scrap-img" />
                                <div className="scrap-caption">{m.title}</div>
                            </div>
                        ))
                    ) : (
                        <p>Loading best moments...</p>
                    )}
                </div>

                <button onClick={() => handleProtectedNavigation('/memories')} className="btn-explore" style={{ background: 'none', border: 'none' }}>
                    Open the Full Gallery &rarr;
                </button>
            </div>
        </section>
    );
};

export default MemoriesFeat;
