import { useState, useEffect } from 'react';
import './Faces.css';

const Faces = () => {
    const [faces, setFaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFaces = async () => {
            try {
                // Adjust URL based on environment if needed, or use relative if proxy is set
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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

    return (
        <section className="faces-section" id="faces">
            <div className="faces-container">
                <h2 className="faces-title">Faces of GareebGang</h2>
                <p className="faces-subtitle">The amazing people behind our community</p>

                <div className="faces-grid">
                    {faces.map((face) => (
                        <div key={face._id} className="face-card">
                            <div className="face-image-container">
                                <img
                                    src={face.imageUrl.startsWith('http') ? face.imageUrl : `http://localhost:5000/${face.imageUrl}`}
                                    alt={face.name}
                                    className="face-image"
                                    loading="lazy"
                                />
                            </div>
                            <div className="face-info">
                                <h3 className="face-name">{face.name}</h3>
                                <p className="face-trait">{face.uniqueTrait}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Faces;
