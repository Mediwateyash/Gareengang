import { useState, useEffect } from 'react';
import apiUrl from '../config';
import './SocialScrapbook.css';
import { FaInstagram, FaYoutube, FaFacebook, FaLink } from 'react-icons/fa'; // Assuming react-icons is installed, if not we fall back to emojis/text

const SocialScrapbook = () => {
    const [socialLinks, setSocialLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSocials = async () => {
            try {
                const res = await fetch(`${apiUrl}/socials`);
                if (!res.ok) throw new Error('Failed to load social links');
                const data = await res.json();
                setSocialLinks(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching social links:", err);
                setLoading(false);
            }
        };

        fetchSocials();
    }, []);

    if (loading || socialLinks.length === 0) return null;

    const getIcon = (platform) => {
        switch (platform) {
            case 'Instagram':
                return <span className="social-icon instagram" style={{ fontFamily: 'sans-serif' }}>📸</span>; // Fallback to emoji if react-icons fails
            case 'YouTube':
                return <span className="social-icon youtube" style={{ fontFamily: 'sans-serif' }}>▶️</span>;
            case 'Facebook':
                return <span className="social-icon facebook" style={{ fontFamily: 'sans-serif' }}>📘</span>;
            default:
                return <span className="social-icon website" style={{ fontFamily: 'sans-serif' }}>🔗</span>;
        }
    };

    return (
        <section className="social-scrapbook-section">
            <div className="social-container">
                <h2 className="social-title">Catch Us Online!</h2>

                <div className="social-grid">
                    {socialLinks.map((link) => (
                        <a
                            key={link._id}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="social-polaroid"
                        >
                            <div className="social-icon-box" style={{ padding: link.imageUrl ? '0' : 'auto' }}>
                                {link.imageUrl ? (
                                    <img
                                        src={link.imageUrl.startsWith('http') ? link.imageUrl : `${apiUrl.replace('/api', '')}/${link.imageUrl}`}
                                        alt={link.accountName}
                                        className="social-profile-img"
                                    />
                                ) : (
                                    getIcon(link.platform)
                                )}
                            </div>
                            <h3 className="social-account-name">{link.accountName}</h3>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialScrapbook;
