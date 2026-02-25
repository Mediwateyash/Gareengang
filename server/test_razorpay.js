const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: 'rzp_live_SK8KIf3BVC6gy0',
    key_secret: 'Cw4zM0l0ttd2hOElRzg1x6mi',
});

async function testOrder() {
    try {
        const options = {
            amount: 50 * 100, // 50 INR
            currency: 'INR',
            receipt: `trip_test_${Date.now()}`,
            payment_capture: 1
        };
        const order = await razorpay.orders.create(options);
        console.log("SUCCESS:", order);
    } catch (err) {
        console.error("FAIL:", JSON.stringify(err, null, 2));
    }
}

testOrder();
