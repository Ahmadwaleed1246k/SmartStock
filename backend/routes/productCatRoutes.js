const express = require('express');
const {addProductCategory, getProductCategoriesByCompID, deleteProductCategory, getProductCategoriesByGroupID} = require('../Controllers/productCatController')

const router = express.Router();

router.post('/addProductCategory', addProductCategory);
router.post('/getProductCategoriesByCompID', getProductCategoriesByCompID)
router.post('/delete-category', deleteProductCategory);
router.post('/getProductCategoriesByGroupID', getProductCategoriesByGroupID);

module.exports = router;
