import { useState, useEffect, useRef } from 'react';
import './AdvanceRewards.css';
import Confetti from 'react-confetti';

const AdvanceRewards = () => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    
    // 3D Parallax Engine State
    const cardRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const targetDate = new Date('2026-04-10T12:30:00+05:30').getTime();

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(timer);
                setIsUnlocked(true);
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    // 3D Mouse Movement Tracking
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const box = card.getBoundingClientRect();
        
        // Calculate mouse position relative to the center of the card
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        const centerX = box.width / 2;
        const centerY = box.height / 2;

        // Calculate rotation angles (max 10 degrees)
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    return (
        <div className="premium-wrapper">
            <div className="ambient-gold-dust"></div>
            <div className="ambient-spotlight"></div>
            
            {isUnlocked && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={800} colors={['#FFD700', '#F5A623', '#FFF', '#B8860B']} />}
            
            <div className="premium-container">
                <div className="premium-header stagger-1">
                    <div className="crown-icon">👑</div>
                    <h1 className="premium-title">CONGRATULATIONS</h1>
                    <h2 className="premium-subtitle">You’ve Unlocked the ELFINALE Reward</h2>
                    <div className="premium-hr"></div>
                    <p className="premium-presenter">The Last Trip of GareebGang<br/><span>Presented by Yash Diwate & Manjush Farad</span></p>
                </div>

                {/* 3D Holographic Card */}
                <div 
                    className="premium-3d-card stagger-2"
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transition: rotation.x === 0 && rotation.y === 0 ? 'transform 0.5s ease-out' : 'none'
                    }}
                >
                    <div className="card-glare" style={{
                        transform: `translate(${rotation.y * -2}px, ${rotation.x * 2}px)`,
                        opacity: (Math.abs(rotation.x) + Math.abs(rotation.y)) / 20
                    }}></div>
                    
                    <h3 className="gold-heading">✅ YOU ARE SELECTED</h3>
                    <p className="highlight-text-gold">🔥 You are among the fastest participants!</p>
                    <p className="body-text">Because of your quick response and early action,<br/><span className="electric-gold">👉 you are eligible for a Special Discount Reward 💸</span></p>
                    
                    <div className="diamond-plaque">
                        <span className="diamond-icon">💎</span> Only a limited number of people made it — and you’re one of them.
                    </div>

                    <div className="countdown-vault">
                        <div className="vault-header">
                            <h3>⏳ REWARD UNLOCK COUNTDOWN</h3>
                            <p>Your Reward Will Be Unlocked Soon!</p>
                            <p className="target-date">10 April | 12:30 PM</p>
                        </div>
                        
                        <div className="timer-display">
                            {isUnlocked ? (
                                <div className="timer-unlocked-gold">ACCESS GRANTED</div>
                            ) : timeLeft ? (
                                <div className="time-blocks">
                                    <div className="t-block"><span>{timeLeft.days}</span><label>DAYS</label></div>
                                    <div className="t-sep">:</div>
                                    <div className="t-block"><span>{String(timeLeft.hours).padStart(2, '0')}</span><label>HRS</label></div>
                                    <div className="t-sep">:</div>
                                    <div className="t-block"><span>{String(timeLeft.minutes).padStart(2, '0')}</span><label>MIN</label></div>
                                    <div className="t-sep">:</div>
                                    <div className="t-block"><span>{String(timeLeft.seconds).padStart(2, '0')}</span><label>SEC</label></div>
                                </div>
                            ) : (
                                <div className="time-blocks">CALCULATING...</div>
                            )}
                        </div>

                        {!isUnlocked && (
                            <div className="wait-warning">
                                <p>⚠️ Your exclusive reward will be revealed exactly when the countdown ends</p>
                                <p className="italic-quote">💥 "The wait is almost over... your reward is about to be revealed."</p>
                            </div>
                        )}
                    </div>

                    {/* REVEAL CHAMBER */}
                    <div className={`reveal-chamber ${isUnlocked ? 'chamber-open' : 'chamber-locked'}`}>
                        {isUnlocked ? (
                            <div className="reward-treasure">
                                <h3 className="treasure-title">🎁 YOUR REWARD</h3>
                                <div className="golden-ticket">
                                    <div className="ticket-borders"></div>
                                    💸 Exclusive Early Bird Discount Applied
                                </div>
                                <p className="treasure-desc">🎉 This special offer is unlocked only for selected participants like you</p>
                            </div>
                        ) : (
                            <div className="lock-mechanism">
                                <div className="padlock">🔒</div>
                                <p>Encrypted Reward Vault</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="premium-footer stagger-3">
                    <h4 className="footer-title">🙏 A SPECIAL THANK YOU</h4>
                    <p className="body-text">We truly appreciate your support and cooperation 🤝</p>
                    <p className="body-text shimmer-text">✨ Thank you for actively participating and helping us in making the trip planning process smooth and well-organized.</p>
                    
                    <div className="signature-plaque">
                        <div className="quote-icon">💬</div>
                        <p>This reward is given as a token of appreciation for your interest, trust, and involvement.</p>
                        
                        <div className="sign-off">
                            <span className="sign-names">~ Yash Diwate & Manjush Farad</span>
                            <span className="sign-titles">Trip Organizers and Managers</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvanceRewards;
