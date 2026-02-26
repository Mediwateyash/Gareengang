import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import groupPhoto from '../assets/group_photo.jpg';
import { useAuth } from '../context/AuthContext';
import './Hero.css';

const Hero = () => {
    const { user, showAuthModal } = useAuth();
    const navigate = useNavigate();
    const [textIndex, setTextIndex] = useState(0);
    const texts = [
        "Trips & Day-Outs",
        "Unfiltered College Memories",
        "Vlogs & Experiences",
        "More coming soon..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % texts.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleProtectedNavigation = (path) => {
        if (!user) {
            showAuthModal('login');
        } else {
            navigate(path);
        }
    };

    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container hero-container-split">

                {/* Left: Text Content */}
                <div className="hero-text-side animate-fade-in">
                    <h1 className="title">GareebGang</h1>
                    <p className="subtitle">Est. Watumull College</p>
                    <div className="tagline">Just some kids making memories...</div>

                    <div className="dynamic-text-wrapper">
                        <p className="dynamic-text" key={textIndex}>{texts[textIndex]}</p>
                    </div>

                    <div className="hero-buttons">
                        <button onClick={() => handleProtectedNavigation('/trips')} className="btn-hero" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', marginRight: '10px' }}>🏕️ Book Trips</button>
                        <Link to="/vlogs" className="btn-hero" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)', border: 'none', color: 'white', marginRight: '10px' }}>▶ Watch Vlogs</Link>
                        <button onClick={() => handleProtectedNavigation('/memories')} className="btn-hero" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: 'white' }}>📸 View Gallery</button>
                    </div>
                </div>

                {/* Right: Polaroid Image */}
                <div className="hero-image-side">
                    <div className="crazy-card-wrapper">
                        <div className="crazy-card">
                            <img src={groupPhoto} alt="GareebGang Squad" className="crazy-img" />
                        </div>
                        {/* Decorative Elements */}
                        <div className="deco-circle"></div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Hero;
