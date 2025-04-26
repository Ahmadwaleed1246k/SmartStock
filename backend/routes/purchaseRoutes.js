const express = require('express');
const {createPurchase} = require('../Controllers/purchaseController')

const router = express.Router();

router.post('/addPurchase', createPurchase);

module.exports = router;