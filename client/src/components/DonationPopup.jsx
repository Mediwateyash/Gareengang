import { useState, useEffect } from 'react';
import './DonationPopup.css';

const DonationPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasSeen, setHasSeen] = useState(false);

    useEffect(() => {
        // Check if they've already seen it this session
        const seenStr = sessionStorage.getItem('hasSeenDonationPopup');
        if (seenStr === 'true') {
            setHasSeen(true);
            return;
        }

        // Show after 120 seconds (120,000 ms)
        const timer = setTimeout(() => {
            setIsVisible(true);
            sessionStorage.setItem('hasSeenDonationPopup', 'true');
        }, 120000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleDonateClick = () => {
        setIsVisible(false);
        // Scroll to donate section if on homepage, else navigate and scroll
        const donateSection = document.getElementById('donate-section');
        if (donateSection) {
            donateSection.scrollIntoView({ behavior: 'smooth' });
            // Optionally, briefly highlight or open the section if needed
            // The section has its own logic, but scrolling there is a good start
        } else {
            window.location.href = '/#donate-section';
        }
    };

    if (!isVisible || hasSeen && !isVisible) return null;

    return (
        <div className="donation-popup-overlay">
            <div className="donation-popup-card">
                <button className="donation-popup-close" onClick={handleClose}>&times;</button>
                <div className="donation-popup-header">
                    <span className="donation-heart-icon">💛</span>
                    <h3>Preserve The Memories</h3>
                </div>
                <div className="donation-popup-body">
                    <p>
                        We noticed you've been enjoying the journey!
                        Maintaining this platform (servers, storage, domain) costs around <strong>₹3000/year</strong>.
                    </p>
                    <p>
                        If you love what we've built, please consider making a small, voluntary contribution to help keep this story alive.
                    </p>
                </div>
                <div className="donation-popup-footer">
                    <button className="btn-popup-cancel" onClick={handleClose}>Maybe Later</button>
                    <button className="btn-popup-donate" onClick={handleDonateClick}>Support Us</button>
                </div>
            </div>
        </div>
    );
};

export default DonationPopup;
