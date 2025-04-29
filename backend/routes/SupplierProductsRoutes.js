const express = require('express');
const router = express.Router();
const { 
  addSupplierProduct, 
  getSuppliersByProduct, 
  deleteSupplierProduct,
  deleteAllSuppliersForProduct
} = require('../Controllers/SupplierProductsController');

router.post('/add-supplier-product', addSupplierProduct);
router.post('/get-suppliers-by-product', getSuppliersByProduct);
router.post('/delete-supplier-product', deleteSupplierProduct);
router.post('/remove-all-suppliers-for-product', deleteAllSuppliersForProduct);

module.exports = router;