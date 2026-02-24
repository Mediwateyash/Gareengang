import { useState } from 'react';
import './DonateSection.css';

const DonateSection = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Hardcoded goal and raised amounts
    const goal = 3000;
    const raised = 1450;
    const progressPercent = Math.min((raised / goal) * 100, 100);

    return (
        <section className="donate-section" id="donate">
            <div className="donate-container">
                <button
                    className={`donate-toggle-btn ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className="donate-heart">💛</span>
                    Preserve The Memories
                    <span className="donate-chevron">{isExpanded ? '▲' : '▼'}</span>
                </button>

                <div className={`donate-content-wrapper ${isExpanded ? 'open' : ''}`}>
                    <div className="donate-content">
                        <p className="donate-intro">
                            This website was created to capture and preserve our journeys, trips, moments, and memories — not just for today, but for years to come.
                        </p>

                        <div className="donate-costs">
                            <h3 className="costs-title">Maintaining this platform involves real costs such as:</h3>
                            <ul className="costs-list">
                                <li><span>🌐</span> Domain renewal</li>
                                <li><span>💾</span> Database storage</li>
                                <li><span>☁️</span> Cloud storage for photos & videos</li>
                                <li><span>🚀</span> Hosting & server charges</li>
                                <li><span>🔧</span> Subscriptions & technical maintenance</li>
                            </ul>
                            <p className="costs-total">
                                The approximate cost to maintain this website for one year is around <strong>₹3000</strong>.
                            </p>
                        </div>

                        <div className="donate-progress-container">
                            <div className="progress-labels">
                                <span className="raised">Raised: ₹{raised}</span>
                                <span className="goal">Goal: ₹{goal}</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${isExpanded ? progressPercent : 0}%` }}
                                ></div>
                            </div>
                            <p className="progress-motivation">This motivates contribution.</p>
                        </div>

                        <div className="donate-plea">
                            <p>To help us keep this platform running smoothly, we humbly request a small contribution.</p>
                            <p>Even a contribution of <strong>₹175</strong> (which supports maintenance for approximately 3 months) would be greatly appreciated.</p>
                            <p>You are free to contribute any amount you feel comfortable with.</p>
                            <p className="donate-voluntary">This is not mandatory — it is purely voluntary support to help preserve our shared memories.</p>
                            <p>Every small contribution helps keep this story alive.</p>
                            <p className="donate-thankyou">Thank you for being a part of this journey. 💛</p>
                        </div>

                        <div className="donate-actions">
                            <h3 className="actions-title">🔥 You Can Add These Donation Options</h3>
                            <p className="actions-subtitle">Suggested Support Amounts:</p>

                            <div className="donation-tiers">
                                <a href="upi://pay?pa=yashdiwate@upi&pn=GareebGang&am=175" className="tier-card" target="_blank" rel="noreferrer">
                                    <div className="tier-amount">₹175</div>
                                    <div className="tier-desc">Support for 3 Months</div>
                                </a>
                                <a href="upi://pay?pa=yashdiwate@upi&pn=GareebGang&am=350" className="tier-card" target="_blank" rel="noreferrer">
                                    <div className="tier-amount">₹350</div>
                                    <div className="tier-desc">Support for 6 Months</div>
                                </a>
                                <a href="upi://pay?pa=yashdiwate@upi&pn=GareebGang&am=1000" className="tier-card featured" target="_blank" rel="noreferrer">
                                    <div className="tier-badge">Best Value</div>
                                    <div className="tier-amount">₹1000</div>
                                    <div className="tier-desc">Annual Supporter</div>
                                </a>
                                <a href="upi://pay?pa=yashdiwate@upi&pn=GareebGang" className="tier-card custom" target="_blank" rel="noreferrer">
                                    <div className="tier-amount">Custom Amount</div>
                                    <div className="tier-desc">Even small amounts make a difference</div>
                                </a>
                            </div>
                            {/* Note for developer: You will need to replace the 'yashdiwate@upi' with the actual UPI ID or payment link later */}
                            <p className="upi-note"><small><i>Currently scanning generic UPI. Ask admin for direct QR code or links.</i></small></p>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default DonateSection;
