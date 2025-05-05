const express = require('express');
const {addProduct, getStockByProduct, getProductLedger, updateProduct, getProductsByCompany, 
    deleteProduct, getPurchasePriceByPrdID, getSalePriceByPrdID, getStockByPrdID, 
    getCompleteStockReport, getProductTransactionHistory, getProductsWithSuppliers, getProductsBySupplier} = require('../Controllers/productController');
const { get } = require('./CompanyRoutes');

const router = express.Router();

router.post('/addProduct', addProduct);
router.post('/get-stock-by-product', getStockByProduct);
router.post('/get-product-ledger', getProductLedger);
router.post('/update-product', updateProduct);
router.post('/get-products-by-company', getProductsByCompany);
router.post('/get-all-products', getProductsByCompany);
router.post('/get-purchase-price-by-PrdId', getPurchasePriceByPrdID);
router.post('/get-sale-price-by-PrdID', getSalePriceByPrdID);
router.post('/get-current-stock', getStockByPrdID);
// Add these new report endpoints
router.post('/complete-stock-report', getCompleteStockReport);
router.post('/get-product-transaction-history', getProductTransactionHistory);
router.post('/delete-product', deleteProduct);
router.post('/get-products-with-suppliers', getProductsWithSuppliers);
router.post('/get-products-by-supplier', getProductsBySupplier);

module.exports = router;
