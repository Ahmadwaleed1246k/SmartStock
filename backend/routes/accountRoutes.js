// routes/accountRoutes.js
const express = require('express');
const {
  addSuppliers,
  addCustomer,
  editAccountInfo,
  getSuppliersByCompany,
  deleteSupplier,
  getCustomersByCompany,
  deleteCustomer,
  addCustomer2
} = require('../Controllers/accountController');

const router = express.Router();

// Supplier routes
router.post('/add-suppliers', addSuppliers);  
router.post('/get-suppliers-by-company', getSuppliersByCompany);
// Add to your existing routes
router.post('/delete-supplier', deleteSupplier);
// Customer routes
router.post('/add-customer', addCustomer);
// Add the new route
router.post('/add-customer2', addCustomer2);
router.post('/get-customers-by-company', getCustomersByCompany);
router.post('/delete-customer', deleteCustomer);

// Account management routes
router.post('/edit-account-info', editAccountInfo);

module.exports = router;