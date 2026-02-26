import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './WelcomeToast.css';

const WelcomeToast = () => {
    const { user, showWelcomeToast, setShowWelcomeToast } = useAuth();
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const toastRef = useRef(null);

    useEffect(() => {
        // Auto-dismiss after 5 seconds if not closed manually
        let timeout;
        if (showWelcomeToast && user) {
            timeout = setTimeout(() => {
                handleClose();
            }, 5000);
        }
        return () => clearTimeout(timeout);
    }, [showWelcomeToast, user]);

    const handleClose = () => {
        if (!toastRef.current) return;

        // Calculate position of the target profile button
        const profileBtn = document.querySelector('.profile-float');

        if (profileBtn) {
            const btnRect = profileBtn.getBoundingClientRect();
            const toastRect = toastRef.current.getBoundingClientRect();

            // Calculate translation distances
            const deltaX = btnRect.left + (btnRect.width / 2) - (toastRect.left + (toastRect.width / 2));
            const deltaY = btnRect.top + (btnRect.height / 2) - (toastRect.top + (toastRect.height / 2));

            // Apply transform dynamically using CSS variables
            toastRef.current.style.setProperty('--fly-x', `${deltaX}px`);
            toastRef.current.style.setProperty('--fly-y', `${deltaY}px`);
        }

        setIsAnimatingOut(true);

        // Wait for animation to finish before unmounting
        setTimeout(() => {
            setShowWelcomeToast(false);
            setIsAnimatingOut(false);
        }, 800); // Matches CSS transition duration
    };

    if (!showWelcomeToast || !user) return null;

    const getRoleDisplayName = (role) => {
        if (role === 'admin') return 'an Admin';
        if (role === 'member') return 'a Member';
        return 'a Visitor';
    };

    return (
        <div className="welcome-toast-overlay">
            <div
                ref={toastRef}
                className={`welcome-toast ${isAnimatingOut ? 'fly-out' : 'fly-in'}`}
            >
                <div className="welcome-toast-content">
                    {user.image ? (
                        <img src={user.image} alt="Avatar" className="welcome-avatar" />
                    ) : (
                        <div className="welcome-avatar-placeholder">👤</div>
                    )}
                    <div className="welcome-text">
                        <h3>Welcome to Gareebgang!</h3>
                        <p>You are currently logged in as <strong>{getRoleDisplayName(user.role)}</strong> of Gareeb Gang.</p>
                    </div>
                </div>
                <button className="welcome-close-btn" onClick={handleClose}>
                    &times;
                </button>
            </div>
        </div>
    );
};

export default WelcomeToast;
