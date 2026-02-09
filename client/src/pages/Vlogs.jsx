import { useEffect, useState } from 'react';
import API_URL from '../config';
import './Vlogs.css';

const Vlogs = () => {
    const [vlogs, setVlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVlog, setSelectedVlog] = useState(null);

    useEffect(() => {
        fetchVlogs();
    }, []);

    const fetchVlogs = async () => {
        try {
            const res = await fetch(`${API_URL}/vlogs`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setVlogs(data);
            } else {
                console.error("Vlogs fetch error:", data);
                setVlogs([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching vlogs:", error);
            setLoading(false);
        }
    };

    const handleVlogClick = (vlog) => {
        setSelectedVlog(vlog);
    };

    const closeViewer = () => {
        setSelectedVlog(null);
    };

    return (
        <section className="vlogs-page">
            <div className="container">
                <h1 className="page-title">The Vlog Archives</h1>
                <p className="page-subtitle">Unfiltered Chaos & Memories</p>

                {loading ? <div className="loader">Loading...</div> : (
                    <div className="vlogs-grid">
                        {vlogs.map((vlog) => (
                            <div key={vlog._id} className="vlog-card" onClick={() => handleVlogClick(vlog)}>
                                <div className="thumbnail-wrapper">
                                    <img
                                        src={`https://img.youtube.com/vi/${vlog.youtubeId}/maxresdefault.jpg`}
                                        alt={vlog.title}
                                        className="thumbnail"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://img.youtube.com/vi/${vlog.youtubeId}/hqdefault.jpg`
                                        }}
                                    />
                                    <div className="play-overlay">
                                        <div className="play-icon">▶</div>
                                    </div>
                                </div>
                                <div className="vlog-info">
                                    <span className="vlog-category">{vlog.category}</span>
                                    <h3 className="vlog-title">{vlog.title}</h3>
                                    <span className="vlog-date">{new Date(vlog.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cinematic Viewer Modal */}
            {selectedVlog && (
                <div className="vlog-modal-overlay" onClick={closeViewer}>
                    <div className="vlog-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={closeViewer}>&times;</button>

                        <div className="iframe-container">
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVlog.youtubeId}?autoplay=1&rel=0`}
                                title={selectedVlog.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                        <div className="modal-info">
                            <h2>{selectedVlog.title}</h2>
                            <a
                                href={selectedVlog.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="yt-btn"
                            >
                                Watch on YouTube ↗
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Vlogs;
