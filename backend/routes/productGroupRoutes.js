const express = require('express');
const router = express.Router();
const { addProductGroup, getAllProductGroupsByCompID, deleteProductGroup } = require('../Controllers/productGroupController');

router.post('/add-product-group', addProductGroup);
router.post('/get-all-product-groups-by-compID', getAllProductGroupsByCompID);
router.post('/delete-product-group', deleteProductGroup);

module.exports = router;
