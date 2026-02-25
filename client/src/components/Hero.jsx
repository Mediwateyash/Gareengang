import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import groupPhoto from '../assets/group_photo.jpg';
import './Hero.css';

const Hero = () => {

    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container hero-container-split">

                {/* Left: Text Content */}
                <div className="hero-text-side animate-fade-in">
                    <h1 className="title">GareebGang</h1>
                    <p className="subtitle">Est. Watumull College</p>
                    <div className="tagline">Just some kids making memories...</div>

                    <div className="hero-buttons">
                        <Link to="/vlogs" className="btn-hero" style={{ background: 'linear-gradient(135deg, #FF0000, #cc0000)', color: 'white', border: 'none' }}>▶ Watch Vlogs</Link>
                        <Link to="/memories" className="btn-hero secondary">View Gallery</Link>
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
