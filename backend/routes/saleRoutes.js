const express = require('express');
const {createSale, getNextVoucherNo} = require('../Controllers/saleController')

const router = express.Router();

router.post('/add-sale', createSale);
router.post('/get-next-voucher', getNextVoucherNo);

module.exports = router;
