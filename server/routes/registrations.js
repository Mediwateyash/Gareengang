const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Trip = require('../models/Trip');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   GET /api/registrations
// @desc    Get all registrations (For Admin Panel)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const registrations = await Registration.find().populate('tripId', 'title dateDisplay status').sort({ createdAt: -1 });
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/registrations/initiate
// @desc    Initiate a new trip booking (Creates Razorpay Order & Pending Registration)
// @access  Public
router.post('/initiate', async (req, res) => {
    try {
        const { tripId, name, phone, queries } = req.body;

        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (trip.status !== 'Booking Open') return res.status(400).json({ message: 'Booking is currently closed for this trip.' });
        if (trip.bookedSlots >= trip.totalSlots) return res.status(400).json({ message: 'Trip is fully booked!' });

        const amount = trip.bookingFee;

        // Create Razorpay Order
        const options = {
            amount: amount * 100, // in paise
            currency: 'INR',
            receipt: `trip_${tripId}_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        // Create Pending Registration in DB
        const registration = new Registration({
            tripId,
            name,
            phone,
            queries,
            paymentStatus: 'Pending',
            amountPaid: amount,
            razorpayOrderId: order.id
        });

        await registration.save();

        res.json({
            success: true,
            order,
            registrationId: registration._id,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        console.error('Trip Registration Init Error:', err);
        res.status(500).json({ message: 'Server error generating checkout', error: err.message });
    }
});

// @route   POST /api/registrations/verify
// @desc    Verify Razorpay payment and confirm trip slot
// @access  Public
router.post('/verify', async (req, res) => {
    try {
        const { registrationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Update Registration Status
            const registration = await Registration.findByIdAndUpdate(registrationId, {
                paymentStatus: 'Completed',
                razorpayPaymentId: razorpay_payment_id
            }, { new: true });

            // Increment Booked Slots on the Trip
            await Trip.findByIdAndUpdate(registration.tripId, {
                $inc: { bookedSlots: 1 }
            });

            return res.status(200).json({ success: true, message: "Slot booked successfully!" });
        } else {
            // If signature fails, mark failed
            await Registration.findByIdAndUpdate(registrationId, { paymentStatus: 'Failed' });
            return res.status(400).json({ success: false, message: "Invalid payment signature!" });
        }
    } catch (err) {
        console.error('Trip Verification Error:', err);
        res.status(500).json({ message: 'Server error verifying slot payment', error: err.message });
    }
});

// @route   DELETE /api/registrations/:id
// @desc    Delete a registration record (For Admin)
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const reg = await Registration.findByIdAndDelete(req.params.id);
        if (!reg) return res.status(404).json({ message: 'Registration not found' });

        // Decrement slot if we delete a completed booking
        if (reg.paymentStatus === 'Completed') {
            await Trip.findByIdAndUpdate(reg.tripId, { $inc: { bookedSlots: -1 } });
        }

        res.json({ message: 'Registration deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
