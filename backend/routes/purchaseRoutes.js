const express = require('express');
const { createPurchase, getAllPurchases, getNextVoucherNo } = require('../Controllers/purchaseController');
const router = express.Router();

router.post('/add-purchase', createPurchase);
router.get('/getAllPurchases', getAllPurchases);
router.post('/get-next-voucher', getNextVoucherNo);

module.exports = router;
