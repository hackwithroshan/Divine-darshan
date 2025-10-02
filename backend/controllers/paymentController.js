const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Booking = require('../models/Booking');
const Subscription = require('../models/Subscription');

// --- START OF FIX: Create a single, reusable Razorpay instance ---
// This is more efficient than creating a new instance for every request.
// The required environment variables are already checked on server startup in server.js.
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// --- END OF FIX ---

exports.createOrder = asyncHandler(async (req, res, next) => {
    const { amount } = req.body;
    
    // Validate that amount is a positive number
    if (!amount || amount <= 0) {
        return next(new ErrorResponse('A valid amount is required to create an order.', 400));
    }

    const options = {
        // Ensure amount is a whole number (integer) as required by Razorpay
        amount: Math.round(amount),
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
    };
    
    // --- START OF FIX: Enhanced Error Handling for Razorpay Order Creation ---
    try {
        const order = await instance.orders.create(options);

        if (!order) {
            // This case is unlikely as Razorpay's client throws on failure, but it's a safe fallback.
            return next(new ErrorResponse('Could not create Razorpay order due to an unknown issue.', 500));
        }

        res.status(200).json({
            success: true,
            order_id: order.id,
            key_id: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        // Log the detailed error from Razorpay for server-side debugging
        console.error('RAZORPAY ORDER CREATION FAILED:', error);

        // Send a more specific and helpful error message to the client.
        // Razorpay often puts the main error message in `error.error.description`.
        const errorMessage = error.error?.description || 'Payment gateway configuration error. Please check API keys and account status.';
        
        // Use the status code from Razorpay if available, otherwise default to 500.
        return next(new ErrorResponse(errorMessage, error.statusCode || 500));
    }
    // --- END OF FIX ---
});


exports.verifyPayment = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
  
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
  
    if (expectedSignature === razorpay_signature) {
      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return next(new ErrorResponse('Payment verification failed. Signature mismatch.', 400));
    }
});

// --- PHONEPE INTEGRATION ---
const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"; // UAT
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = 1;

exports.createPhonepeOrder = asyncHandler(async (req, res, next) => {
    const { amount, details, type } = req.body;
    const merchantTransactionId = `DD-${crypto.randomUUID().split('-')[0]}`;
    const userId = req.user.id;

    const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: userId.toString(),
        amount: amount * 100, // Amount in paise
        redirectUrl: `${process.env.FRONTEND_URL}/#/payment/status?merchantTransactionId=${merchantTransactionId}`,
        redirectMode: "GET",
        callbackUrl: `${req.protocol}://${req.get('host')}/api/payments/phonepe/callback`, // Server-to-server
        mobileNumber: details.phoneNumber,
        paymentInstrument: {
            type: "PAY_PAGE",
        },
        // Store booking/subscription details to retrieve after payment
        notes: { details, type } 
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum = crypto.createHash('sha256').update(base64Payload + "/pg/v1/pay" + SALT_KEY).digest("hex") + "###" + SALT_INDEX;

    try {
        const response = await axios.post(`${PHONEPE_HOST_URL}/pg/v1/pay`, { request: base64Payload }, {
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": checksum,
            }
        });
        
        const redirectUrl = response.data?.data?.instrumentResponse?.redirectInfo?.url;
        if (redirectUrl) {
            res.status(200).json({ success: true, redirectUrl });
        } else {
            console.error("PhonePe order creation failed, unexpected response:", response.data);
            return next(new ErrorResponse("Failed to get redirect URL from payment gateway.", 500));
        }

    } catch (error) {
        console.error("PhonePe API Error:", error.response ? error.response.data : error.message);
        return next(new ErrorResponse(error.response?.data?.message || "Payment gateway error.", error.response?.status || 500));
    }
});

exports.verifyPhonepePayment = asyncHandler(async (req, res, next) => {
    const { merchantTransactionId } = req.body;
    if (!merchantTransactionId) {
        return next(new ErrorResponse("Transaction ID is missing.", 400));
    }
    
    const checksum = crypto.createHash('sha256').update(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY).digest("hex") + "###" + SALT_INDEX;
    
    try {
        const response = await axios.get(`${PHONEPE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`, {
             headers: {
                "Content-Type": "application/json",
                "X-VERIFY": checksum,
                "X-MERCHANT-ID": MERCHANT_ID,
            }
        });

        const paymentData = response.data.data;
        if (response.data.success && paymentData.responseCode === 'SUCCESS') {
            const notesBuffer = Buffer.from(paymentData.notes, 'base64');
            const notesString = notesBuffer.toString('utf-8');
            const notes = JSON.parse(notesString);
            const { details, type } = notes;

            let finalRecord;
            if (type === 'booking') {
                 finalRecord = await Booking.create({
                    ...details,
                    id: merchantTransactionId,
                    userId: req.user.id,
                    userEmail: req.user.email,
                });
            } else if (type === 'subscription') {
                const deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + 7);
                const nextDeliveryDate = deliveryDate.toISOString().split('T')[0];
                
                finalRecord = await Subscription.create({
                    ...details,
                    id: merchantTransactionId,
                    userId: req.user.id,
                    nextDeliveryDate
                });
            }

            res.status(200).json({ success: true, message: "Payment successful and recorded.", data: finalRecord });

        } else {
            res.status(400).json({ success: false, message: response.data.message || "Payment verification failed." });
        }
    } catch (error) {
        console.error("PhonePe Status Check Error:", error.response ? error.response.data : error.message);
        return next(new ErrorResponse(error.response?.data?.message || "Error verifying payment.", error.response?.status || 500));
    }
});