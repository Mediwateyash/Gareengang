import { useState, useEffect } from 'react';
import apiUrl from '../config';
import './VideoReviews.css';

const VideoReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${apiUrl}/reviews`);
                if (!res.ok) throw new Error('Failed to load Video Reviews');
                const data = await res.json();
                setReviews(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load reviews. Please try again later.');
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const extractYouTubeID = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    if (error) {
        return (
            <section className="video-reviews-section">
                <div className="video-reviews-container">
                    <h2 className="reviews-title">Community Voices</h2>
                    <div className="reviews-error">{error}</div>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="video-reviews-section">
                <div className="video-reviews-container">
                    <h2 className="reviews-title">Community Voices</h2>
                    <div className="reviews-loading">Loading testimonies...</div>
                </div>
            </section>
        );
    }

    if (reviews.length === 0) {
        return null;
    }

    return (
        <section className="video-reviews-section" id="reviews">
            <div className="video-reviews-container">
                <h2 className="reviews-title">What the Gang Says</h2>
                <p className="reviews-subtitle">Real stories from our amazing community members</p>

                <div className="reviews-carousel-wrapper">
                    <div className="reviews-horizontal-scroll">
                        {reviews.map((review) => {
                            const ytId = extractYouTubeID(review.youtubeUrl);
                            if (!ytId) return null; // Fallback if somehow invalid ID gets through

                            return (
                                <div key={review._id} className="review-card">
                                    <div className="video-container">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${ytId}`}
                                            title={`${review.name}'s review`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                    <div className="review-info">
                                        <h3 className="reviewer-name">{review.name}</h3>
                                        <p className="reviewer-role">{review.role}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VideoReviews;
