const express = require('express');
const {addProductCategory} = require('../Controllers/productCatController')

const router = express.Router();

router.post('/addProductCategory', addProductCategory);

module.exports = router;