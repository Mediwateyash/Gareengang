import { useState, useEffect } from 'react';
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
            <div className="container hero-content">
                <div className="hero-text animate-fade-in">
                    <h1 className="title">GareebGang</h1>
                    <p className="subtitle">A student-driven community from Watumull College, Ulhasnagar</p>
                    <div className="tagline">Memories &bull; Trips &bull; Brotherhood</div>

                    <div className="dynamic-text-wrapper">
                        <p className="dynamic-text" key={textIndex}>{texts[textIndex]}</p>
                    </div>
                </div>
            </div>

            {/* Abstract Animated Background Elements */}
            <div className="shape shape-1 animate-float"></div>
            <div className="shape shape-2 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="shape shape-3 animate-float" style={{ animationDelay: '2s' }}></div>
        </section>
    );
};

export default Hero;
