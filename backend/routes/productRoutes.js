const express = require('express');
const {addProduct, getStockByProduct, getProductLedger, updateProduct} = require('../Controllers/productController')

const router = express.Router();

router.post('/addProduct', addProduct);
router.post('/get-stock-by-product', getStockByProduct);
router.post('/get-product-ledger', getProductLedger);
router.post('/update-product', updateProduct);

module.exports = router;