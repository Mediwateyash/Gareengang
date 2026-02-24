import { useState, useEffect } from 'react';
import apiUrl, { API_BASE_URL } from '../config';
import yashImg from '../assets/yash_president.png';
import manjushImg from '../assets/manjush_vp.png';
import './Leaders.css';

const Leaders = () => {
    const [mediaItems, setMediaItems] = useState([]);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await fetch(`${apiUrl}/subpillars`);
                if (!res.ok) throw new Error('Failed to fetch action moments');
                const data = await res.json();
                setMediaItems(data);
            } catch (err) {
                console.error("Error fetching pillar media:", err);
            }
        };

        fetchMedia();
    }, []);

    const presidentMedia = mediaItems.filter(m => m.pillarTarget === 'President');
    const vpMedia = mediaItems.filter(m => m.pillarTarget === 'VP');

    const renderFilmstrip = (items) => {
        if (items.length === 0) return null;

        return (
            <div className="action-moments-wrapper">
                <div className="action-moments-title">Behind the scenes...</div>
                <div className="filmstrip-scroll">
                    {items.map(item => {
                        const srcUrl = item.mediaUrl.startsWith('http') ? item.mediaUrl : `${API_BASE_URL}/${item.mediaUrl}`;

                        return (
                            <div key={item._id} className="filmstrip-item">
                                {item.mediaType === 'video' ? (
                                    <>
                                        <video src={srcUrl} className="filmstrip-media" muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                                        <div className="video-icon-overlay">▶</div>
                                    </>
                                ) : (
                                    <img src={srcUrl} alt={item.caption} className="filmstrip-media" />
                                )}
                                <div className="filmstrip-caption">{item.caption}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <section className="leaders-section">
            <div className="leaders-container">
                <h2 className="leaders-title">The Pillars</h2>

                <div className="leaders-grid">

                    {/* President Column */}
                    <div className="pillar-column">
                        <div className="leader-card-scrap">
                            <div className="leader-img-box">
                                <img src={yashImg} alt="Diwate Yash" className="leader-img-scrap" />
                            </div>
                            <div className="leader-info-scrap">
                                <h3 className="leader-name-scrap">Diwate Yash</h3>
                                <p className="leader-role-scrap">President (अध्यक्ष)</p>
                                <p className="leader-desc-scrap">Watumull Mitra Mandal.</p>
                            </div>
                            <span className="note-deco">Leader #1</span>
                        </div>
                        {renderFilmstrip(presidentMedia)}
                    </div>

                    {/* Vice President Column */}
                    <div className="pillar-column">
                        <div className="leader-card-scrap">
                            <div className="leader-img-box">
                                <img src={manjushImg} alt="Manjush Farad" className="leader-img-scrap" />
                            </div>
                            <div className="leader-info-scrap">
                                <h3 className="leader-name-scrap">Manjush Farad</h3>
                                <p className="leader-role-scrap">Vice President (उपाध्यक्ष)</p>
                                <p className="leader-desc-scrap">Watumull Mitra Mandal.</p>
                            </div>
                            <span className="note-deco">The VP</span>
                        </div>
                        {renderFilmstrip(vpMedia)}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Leaders;
