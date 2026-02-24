import { useState, useEffect } from 'react';
import apiUrl, { API_BASE_URL } from '../config';
import './Faces.css';

const Faces = () => {
    const [faces, setFaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchFaces = async () => {
            try {
                // Adjust URL based on environment if needed, or use relative if proxy is set
                const res = await fetch(`${apiUrl}/faces`);
                if (!res.ok) throw new Error('Failed to load Faces of GareebGang');
                const data = await res.json();
                setFaces(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load data. Please try again later.');
                setLoading(false);
            }
        };

        fetchFaces();
    }, []);

    if (error) {
        return (
            <section className="faces-section" id="faces">
                <div className="faces-container">
                    <h2 className="faces-title">Faces of GareebGang</h2>
                    <div className="faces-error">{error}</div>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="faces-section" id="faces">
                <div className="faces-container">
                    <h2 className="faces-title">Faces of GareebGang</h2>
                    <div className="faces-loading">Loading members...</div>
                </div>
            </section>
        );
    }

    if (faces.length === 0) {
        return null; // Don't render section if empty
    }

    // Determine if we need the "show more" functionality (e.g. more than 4 on desktop usually wraps to 2nd row)
    const needsExpansion = faces.length > 4;

    return (
        <section className="faces-section" id="faces">
            <div className="faces-container">
                <h2 className="faces-title">Faces of GareebGang</h2>
                <p className="faces-subtitle">The amazing people behind our community</p>

                <div className={`faces-grid-wrapper ${isExpanded ? 'expanded' : ''} ${!needsExpansion ? 'no-expansion-needed' : ''}`}>
                    <div className="faces-grid">
                        {faces.map((face, index) => (
                            <div key={face._id} className="face-card">
                                <div className="face-image-container">
                                    <img
                                        src={face.imageUrl.startsWith('http') ? face.imageUrl : `${API_BASE_URL}/${face.imageUrl}`}
                                        alt={face.name}
                                        className="face-image"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="face-info">
                                    <h3 className="face-name">{face.name}</h3>
                                    <p className="face-trait">{face.uniqueTrait}</p>
                                </div>
                                <span className="face-card-note">Member #{index + 1}</span>
                            </div>
                        ))}
                    </div>

                    {!isExpanded && needsExpansion && (
                        <div className="faces-blur-overlay">
                            <button className="faces-see-more-btn" onClick={() => setIsExpanded(true)}>
                                See More Faces
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Faces;
