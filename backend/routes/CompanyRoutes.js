const express = require('express');
const { addCompany, getCompanyByName, getCompanyByID, editCompanyInfo, getCompanyStock, getDayBook } = require('../Controllers/companyController');

const router = express.Router();

router.post('/add-company', addCompany);
router.post('/get-company-by-name', getCompanyByName);
router.post('/get-company-by-id', getCompanyByID);
router.post('/edit-company-info', editCompanyInfo);
router.post('/get-company-stock', getCompanyStock);
router.post('/get-daybook', getDayBook);
//router.post('/login', loginCompany);

module.exports = router;
