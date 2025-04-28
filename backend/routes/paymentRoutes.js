const express = require('express');
const router = express.Router();
const{createPayment, getNextVoucherNo} = require('../Controllers/paymentController');

// Create a new payment
router.post('/create', createPayment);

// Get next voucher number
router.post('/get-next-voucher', getNextVoucherNo);

module.exports = router;