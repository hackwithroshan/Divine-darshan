
const Razorpay = require('razorpay');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// Check for Razorpay keys on startup
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('--- FATAL ERROR: Razorpay API keys are not defined in environment variables. ---');
    console.error('Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.');
    process.exit(1);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc      Create a Razorpay Order
// @route     POST /api/payments/create-order
// @access    Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorResponse('Please provide a valid amount', 400));
  }

  const options = {
    amount, // amount in the smallest currency unit (paise)
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    if (!order) {
        return next(new ErrorResponse('Failed to create Razorpay order', 500));
    }

    res.status(200).json({
        success: true,
        order_id: order.id,
        key_id: process.env.RAZORPAY_KEY_ID, // Send public key to frontend
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return next(new ErrorResponse('Could not create payment order', 500));
  }
});