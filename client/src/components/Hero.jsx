import { useState, useEffect } from 'react';
import groupPhoto from '../assets/group_photo.jpg';
import './Hero.css';

const Hero = () => {
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

    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container hero-container-split">

                {/* Left: Text Content */}
                <div className="hero-text-side animate-fade-in">
                    <h1 className="title">GareebGang</h1>
                    <p className="subtitle">Watumull College's Finest</p>
                    <div className="tagline">Memories &bull; Trips &bull; Brotherhood</div>

                    <div className="dynamic-text-wrapper">
                        <p className="dynamic-text" key={textIndex}>{texts[textIndex]}</p>
                    </div>
                </div>

                {/* Right: Crazy 3D Image Card */}
                <div className="hero-image-side">
                    <div className="crazy-card-wrapper">
                        <div className="crazy-card">
                            <img src={groupPhoto} alt="GareebGang Squad" className="crazy-img" />
                            <div className="crazy-border"></div>
                        </div>
                        {/* Decorative Elements */}
                        <div className="deco-circle"></div>
                        <div className="deco-dots"></div>
                    </div>
                </div>

            </div>

            {/* Background Atmosphere */}
            <div className="shape shape-1" style={{ top: '-10%', left: '-10%', filter: 'blur(100px)' }}></div>
            <div className="shape shape-2" style={{ bottom: '-10%', right: '-10%', filter: 'blur(100px)' }}></div>
        </section>
    );
};

export default Hero;
