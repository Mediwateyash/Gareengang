import { useState } from 'react';
import apiUrl from '../config';
import './DonateSection.css';

const DonateSection = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Hardcoded goal and raised amounts
    // Ideally this could be pulled from the backend in the future based on successful payments
    const goal = 3000;
    const raised = 1450;
    const progressPercent = Math.min((raised / goal) * 100, 100);

    const handlePayment = async (amount) => {
        setIsProcessing(true);
        try {
            // 1. Create order on backend
            const orderRes = await fetch(`${apiUrl}/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok || !orderData.success) {
                alert('Could not initiate payment. ' + (orderData.message || ''));
                setIsProcessing(false);
                return;
            }

            // 2. Initialize Razorpay Checkout
            const options = {
                key: orderData.key_id, // Enter the Key ID generated from the Dashboard
                amount: orderData.order.amount, // Amount in paise
                currency: "INR",
                name: "GareebGang Watumull",
                description: "Preserve The Memories Contribution",
                image: "https://your-server-url.com/logo.png", // Replace with actual logo URL if available
                order_id: orderData.order.id,
                handler: async function (response) {
                    // 3. Verify Payment on Backend
                    try {
                        const verifyRes = await fetch(`${apiUrl}/payment/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            setPaymentSuccess(true);
                            // Optional: Here you would trigger a re-fetch of the total raised amount
                        } else {
                            alert("Payment verification failed!");
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        alert("An error occurred during verification.");
                    }
                },
                prefill: {
                    name: "GareebGang Supporter",
                    email: "supporter@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3b82f6"
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
            });

            rzp.open();

        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment gateway could not be loaded.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCustomAmount = () => {
        const amount = prompt("Enter the amount you would like to contribute (in ₹):");
        if (amount && !isNaN(amount) && parseInt(amount) > 0) {
            handlePayment(parseInt(amount));
        } else if (amount !== null) {
            alert("Please enter a valid amount.");
        }
    };

    return (
        <section className="donate-section" id="donate-section">
            <div className="donate-container">
                <button
                    className={`donate-toggle-btn ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="donate-btn-content">
                        <span className="donate-main-text">
                            <span className="donate-heart">💛</span>
                            Preserve The Memories
                        </span>
                        <span className="donate-sub-text">Click here to see how you can help keep our story alive!</span>
                    </div>
                    <span className="donate-chevron">{isExpanded ? '▲' : '▼'}</span>
                </button>

                <div className={`donate-content-wrapper ${isExpanded ? 'open' : ''}`}>
                    <div className="donate-content">

                        {paymentSuccess ? (
                            <div className="donate-success-message" style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <h2 style={{ color: '#22c55e', fontSize: '2rem', marginBottom: '1rem' }}>🎉 Thank You! 🎉</h2>
                                <p style={{ fontSize: '1.2rem', color: '#334155' }}>Your contribution has been received successfully.</p>
                                <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Every small contribution helps keep this shared story alive.</p>
                                <button className="donate-toggle-btn" style={{ marginTop: '2rem', width: 'auto', padding: '0.8rem 2rem' }} onClick={() => setPaymentSuccess(false)}>
                                    Back to Section
                                </button>
                            </div>
                        ) : (
                            <>
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
                                    <h3 className="actions-title">🔥 Support Options</h3>
                                    <p className="actions-subtitle">Choose an amount to proceed with Razorpay:</p>

                                    <div className="donation-tiers">
                                        <button
                                            onClick={() => handlePayment(175)}
                                            className="tier-card"
                                            disabled={isProcessing}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                                        >
                                            <div className="tier-amount">₹175</div>
                                            <div className="tier-desc">Support for 3 Months</div>
                                        </button>
                                        <button
                                            onClick={() => handlePayment(350)}
                                            className="tier-card"
                                            disabled={isProcessing}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                                        >
                                            <div className="tier-amount">₹350</div>
                                            <div className="tier-desc">Support for 6 Months</div>
                                        </button>
                                        <button
                                            onClick={() => handlePayment(1000)}
                                            className="tier-card featured"
                                            disabled={isProcessing}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                                        >
                                            <div className="tier-badge">Best Value</div>
                                            <div className="tier-amount">₹1000</div>
                                            <div className="tier-desc">Annual Supporter</div>
                                        </button>
                                        <button
                                            onClick={handleCustomAmount}
                                            className="tier-card custom"
                                            disabled={isProcessing}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                                        >
                                            <div className="tier-amount">Custom Amount</div>
                                            <div className="tier-desc">Enter any amount via Razorpay</div>
                                        </button>
                                    </div>
                                    <p className="upi-note"><small><i>Payments securely processed via <strong>Razorpay</strong></i></small></p>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </section>
    );
};

export default DonateSection;
