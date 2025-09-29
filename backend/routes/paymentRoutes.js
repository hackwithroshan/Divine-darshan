
const express = require('express');
const { createOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are for authenticated users
router.use(protect);

router.post('/create-order', createOrder);

module.exports = router;