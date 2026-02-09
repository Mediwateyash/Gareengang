import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';

const HomeVlogs = () => {
    const [vlogs, setVlogs] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/vlogs`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setVlogs(data.slice(0, 3));
                } else {
                    console.error("Vlogs data is not an array:", data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <section className="home-vlogs-section">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Nanum+Pen+Script&display=swap');

                    .home-vlogs-section {
                        background: #fdfbf7;
                        background-image: url("https://www.transparenttextures.com/patterns/notebook-paper.png");
                        padding: 6rem 1rem;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }

                    .hvs-title {
                        font-family: 'Permanent Marker', cursive;
                        font-size: 3.5rem;
                        color: #2c3e50;
                        transform: rotate(-2deg);
                        margin-bottom: 3rem;
                        text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
                        display: inline-block;
                        position: relative;
                    }

                    .hvs-title::after {
                        content: '';
                        position: absolute;
                        bottom: -10px;
                        left: 0;
                        width: 100%;
                        height: 5px;
                        background: #ff6b6b;
                        border-radius: 5px;
                        transform: rotate(2deg);
                    }

                    .cards-container {
                        display: flex;
                        justify-content: center;
                        flex-wrap: wrap;
                        gap: 4rem;
                        margin-bottom: 4rem;
                    }

                    .polaroid-card {
                        background: white;
                        padding: 1rem 1rem 3rem 1rem;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                        transform: rotate(var(--rot));
                        transition: all 0.3s ease;
                        max-width: 320px;
                        position: relative;
                    }

                    .polaroid-card::before {
                        content: '';
                        position: absolute;
                        top: -15px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 100px;
                        height: 30px;
                        background: rgba(255, 255, 255, 0.4);
                        border: 1px solid rgba(0,0,0,0.1);
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        z-index: 2; /* Tape effect */
                        background-color: #e0e0e0;
                        opacity: 0.7;
                    }

                    .polaroid-card:hover {
                        transform: scale(1.05) rotate(0deg) !important;
                        box-shadow: 0 15px 30px rgba(0,0,0,0.25);
                        z-index: 10;
                    }

                    .polaroid-img {
                        width: 100%;
                        aspect-ratio: 4/3;
                        object-fit: cover;
                        filter: sepia(0.2) contrast(1.1);
                        margin-bottom: 1rem;
                    }

                    .polaroid-caption {
                        font-family: 'Nanum Pen Script', cursive;
                        font-size: 1.8rem;
                        color: #444;
                        line-height: 1.2;
                    }

                    .btn-scrapbook {
                        font-family: 'Permanent Marker', cursive;
                        font-size: 1.5rem;
                        color: #fff;
                        background: #ff6b6b;
                        padding: 1rem 2rem;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        transform: rotate(2deg);
                        box-shadow: 5px 5px 0px #2c3e50;
                        transition: all 0.2s ease;
                        border: 2px solid #2c3e50;
                    }

                    .btn-scrapbook:hover {
                        transform: rotate(0deg) scale(1.05);
                        box-shadow: 2px 2px 0px #2c3e50;
                    }

                    /* Doodles */
                    .doodle {
                        position: absolute;
                        opacity: 0.1;
                        pointer-events: none;
                    }
                `}
            </style>

            <h2 className="hvs-title">Vlogs & Memories</h2>

            <div className="cards-container">
                {vlogs.map((vlog, index) => {
                    const rotation = index % 2 === 0 ? '-3deg' : '3deg';
                    return (
                        <div key={vlog._id} className="polaroid-card" style={{ '--rot': rotation }}>
                            <img
                                src={`https://img.youtube.com/vi/${vlog.youtubeId}/hqdefault.jpg`}
                                alt={vlog.title}
                                className="polaroid-img"
                            />
                            <div className="polaroid-caption">{vlog.title}</div>
                        </div>
                    )
                })}
            </div>

            <Link to="/vlogs" className="btn-scrapbook">
                Relive all moments &rarr;
            </Link>
        </section>
    );
};

export default HomeVlogs;
