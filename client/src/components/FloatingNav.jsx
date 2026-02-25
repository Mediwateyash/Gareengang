import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaWhatsapp, FaHome } from 'react-icons/fa';
import './FloatingNav.css';

const FloatingNav = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show top button when page is scrolled down
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="floating-nav-container">
            {/* Floating Home Button */}
            <Link to="/" className="home-float" title="Back to Homepage">
                <span className="home-tooltip">Go to Home</span>
                <FaHome />
            </Link>

            {/* Floating WhatsApp Contact Button */}
            <a
                href="https://wa.me/918799903365?text=Hi%20President%20Yash,%20I%20have%20a%20query%20about%20GareebGang!"
                className="whatsapp-float"
                target="_blank"
                rel="noopener noreferrer"
                title="Any Queries? Contact President Yash"
            >
                <span className="whatsapp-tooltip">Any Queries? Contact President Yash</span>
                <FaWhatsapp />
            </a>

            {/* Floating Back to Top Button */}
            <button
                className={`back-to-top ${isVisible ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <FaArrowUp />
            </button>
        </div>
    );
};

export default FloatingNav;
