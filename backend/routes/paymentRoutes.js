const express = require('express');
const router = express.Router();
const{createPayment, getNextVoucherNo, getPaymentDueNotifications} = require('../Controllers/paymentController');

// Create a new payment
router.post('/create', createPayment);

// Get next voucher number
router.post('/get-next-voucher', getNextVoucherNo);
router.post('/get-payment-due-notifications', getPaymentDueNotifications);

module.exports = router;
