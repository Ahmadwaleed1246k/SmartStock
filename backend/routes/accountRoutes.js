const express = require('express');
const {addCustomer, addSupplier, editAccountInfo, getCustomersByCompany, 
    getSuppliersByCompany, getAccountTransactionHistory,
     getSuppliersByCompID, ensureLocalPurchaseAccount
    , ensureLocalSaleAccount, getPaymentAccounts, getOutstandingBalance
, deleteSupplier, addCustomer2, deleteCustomer, getSuppliersByCompany2
, ensureCashBankAccounts, getCashBankAccounts, ensureWalkInCustomer, getAccountLedger, getAllAccounts} = require('../Controllers/accountController')

const router = express.Router();

router.post('/add-customer', addCustomer);
router.post('/add-suppliers', addSupplier);
router.post('/edit-account-info', editAccountInfo);
router.post('/get-customers-by-company', getCustomersByCompany);
router.post('/get-suppliers-by-company', getSuppliersByCompany);
router.post('/get-suppliers-by-company2', getSuppliersByCompany2);
router.post('/get-suppliers-by-compID', getSuppliersByCompID);
router.post('/ensure-local-purchase', ensureLocalPurchaseAccount);
router.post('/ensure-local-sale', ensureLocalSaleAccount);
router.post('/get-account-transaction-history', getAccountTransactionHistory);
router.post('/get-payment-accounts', getPaymentAccounts);
router.post('/get-outstanding-balance', getOutstandingBalance);
router.post('/delete-supplier', deleteSupplier);
router.post('/add-customer2', addCustomer2);
router.post('/delete-customer', deleteCustomer);
router.post('/ensure-cash-bank', ensureCashBankAccounts);
router.post('/get-cash-bank', getCashBankAccounts);
router.post('/ensure-walkin', ensureWalkInCustomer);
router.post('/get-account-ledger', getAccountLedger);
router.post('/get-all-accounts', getAllAccounts);
module.exports = router;
