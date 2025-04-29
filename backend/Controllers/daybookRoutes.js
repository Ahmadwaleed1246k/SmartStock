const express = require('express');
const { getDaybook } = require('../Controllers/daybookController');
const router = express.Router();

// Change to GET request since we're querying data
router.get('/get-daybook', getDaybook);

module.exports = router;