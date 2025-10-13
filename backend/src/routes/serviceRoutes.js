const express = require('express');
const router = express.Router();
const { createService, listServices } = require('../controllers/serviceController');

router.post('/', createService);
router.get('/', listServices);

module.exports = router;
