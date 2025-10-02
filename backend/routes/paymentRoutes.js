
const express = require('express');
const { createOrder, verifyPayment, createPhonepeOrder, verifyPhonepePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are for authenticated users
router.use(protect);

// Razorpay Routes
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

// PhonePe Routes
router.post('/phonepe/create-order', createPhonepeOrder);
router.post('/phonepe/verify-payment', verifyPhonepePayment);


module.exports = router;
