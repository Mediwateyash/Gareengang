import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaArrowUp, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // Scroll to top smoothly
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Helper for smooth scrolling to sections on the homepage
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="site-footer">
            <div className="footer-container">

                {/* Column 1: Brand */}
                <div className="footer-col">
                    <h2 className="footer-brand">GareebGang Watumull</h2>
                    <p className="footer-vision">
                        Built to preserve memories, journeys, and friendships.
                    </p>
                </div>

                {/* Column 2: Quick Links */}
                <div className="footer-col">
                    <h3>Quick Links</h3>
                    <ul className="footer-links">
                        <li><Link to="/" onClick={() => scrollToTop()}>Home</Link></li>
                        <li><Link to="/memories">Memories</Link></li>
                        <li><Link to="/vlogs">Trips</Link></li>
                        <li><span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('faces-section')}>Pillars</span></li>
                        <li><span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('donate-section')}>Preserve The Memories</span></li>
                    </ul>
                </div>

                {/* Column 3: Contact */}
                <div className="footer-col">
                    <h3>Contact Us</h3>
                    <div className="footer-contact">
                        <p>
                            <span className="contact-name">Yash Diwate</span>
                            <a href="tel:8799903365" className="contact-number">+91 87999 03365</a>
                            <a href="mailto:diwateyash2004@gmail.com" className="contact-email">diwateyash2004@gmail.com</a>
                        </p>
                        <p>
                            <span className="contact-name">Manjush Farad</span>
                            <a href="tel:9766074255" className="contact-number">+91 97660 74255</a>
                            <a href="mailto:manjushfarad@gmail.com" className="contact-email">manjushfarad@gmail.com</a>
                        </p>
                    </div>
                </div>

                {/* Column 4: Quote & Legal */}
                <div className="footer-col">
                    <p className="footer-quote">
                        "Some moments deserve to live forever."
                    </p>
                    <div className="footer-legal">
                        <p>This platform is independently managed and not affiliated with any official institution.</p>
                        <p>All contributions are voluntary and used solely for website maintenance.</p>
                    </div>
                </div>

            </div>

            {/* Bottom Strip */}
            <div className="footer-bottom">
                <div className="copyright">
                    &copy; 2026 GareebGang Watumull. All rights reserved.
                </div>
                <div className="portfolio">
                    Designed & Developed with ❤️ by <a href="#" className="portfolio-link">Yash</a>
                </div>
            </div>

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
        </footer>
    );
};

export default Footer;
