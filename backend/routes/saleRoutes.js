const express = require('express');
const {createSale} = require('../Controllers/saleController')

const router = express.Router();

router.post('/addSale', createSale);

module.exports = router;