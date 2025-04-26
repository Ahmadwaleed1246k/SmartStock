const express = require('express');
const {addCustomer, addSuppliers, editAccountInfo} = require('../Controllers/accountController')

const router = express.Router();

router.post('/addCustomer', addCustomer);
router.post('/addSupplier', addSuppliers);
router.post('/edit-account-info', editAccountInfo);


module.exports = router;