import { useState, useEffect } from 'react';
import apiUrl from '../config';
import './SocialScrapbook.css';
import { FaInstagram, FaYoutube, FaFacebook, FaLink } from 'react-icons/fa';

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

    const getPlatformTheme = (platform) => {
        switch (platform) {
            case 'Instagram': return 'instagram';
            case 'YouTube': return 'youtube';
            case 'Facebook': return 'facebook';
            default: return 'other';
        }
    };

    const getButtonText = (platform) => {
        switch (platform) {
            case 'Instagram': return 'Follow on Instagram';
            case 'YouTube': return 'Subscribe on YouTube';
            case 'Facebook': return 'Like on Facebook';
            default: return 'Visit Website';
        }
    };

    const getButtonIcon = (platform) => {
        switch (platform) {
            case 'Instagram': return <FaInstagram />;
            case 'YouTube': return <FaYoutube />;
            case 'Facebook': return <FaFacebook />;
            default: return <FaLink />;
        }
    };

    return (
        <section className="social-scrapbook-section">
            <div className="social-container">
                <h2 className="social-title">Connect With Us</h2>

                <div className="social-grid">
                    {socialLinks.map((link) => {
                        const theme = getPlatformTheme(link.platform);
                        return (
                            <a
                                key={link._id}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`social-profile-card ${theme}`}
                            >
                                <div className="social-avatar-container">
                                    {link.imageUrl ? (
                                        <img
                                            src={link.imageUrl.startsWith('http') ? link.imageUrl : `${apiUrl.replace('/api', '')}/${link.imageUrl}`}
                                            alt={link.accountName}
                                            className="social-profile-img"
                                        />
                                    ) : (
                                        <div className="social-icon-fallback">
                                            {getButtonIcon(link.platform)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="social-username">{link.accountName}</h3>
                                <button className="social-follow-btn">
                                    {getButtonIcon(link.platform)}
                                    {getButtonText(link.platform)}
                                </button>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default SocialScrapbook;
