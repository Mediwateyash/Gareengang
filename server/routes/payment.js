const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance with your keys
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/payment/create-order
// @desc    Create a new Razorpay order
// @access  Public
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body; // Amount should be passed in INR from frontend

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: 'Invalid amount provided' });
        }

        const options = {
            amount: parseInt(amount) * 100, // Razorpay expects amount in the smallest currency sub-unit (paise)
            currency: 'INR',
            receipt: `gg_receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            payment_capture: 1 // Auto-capture payment
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ message: 'Error creating Razorpay order' });
        }

        res.json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID // Safe to send to frontend for the checkout script
        });

    } catch (err) {
        console.error('Razorpay Create Order Error:', err);
        res.status(500).json({ message: 'Server error creating order', error: err.message });
    }
});

// @route   POST /api/payment/verify
// @desc    Verify a successful payment cryptographic signature
// @access  Public
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Create the HMAC signature using the Secret Key
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        // Verify that the generated signature matches the one sent by Razorpay
        if (razorpay_signature === expectedSign) {
            // Payment verified successfully!
            // Here you could optionally save the transaction to the database

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid signature sent!"
            });
        }
    } catch (err) {
        console.error('Razorpay Verification Error:', err);
        res.status(500).json({ message: 'Server error verifying payment', error: err.message });
    }
});

module.exports = router;
