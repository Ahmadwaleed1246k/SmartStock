const express = require('express');
const {addPaymentMethod} = require('../Controllers/paymentMethodController')

const router = express.Router();

router.post('/addPaymentMethod', addPaymentMethod);

module.exports = router;