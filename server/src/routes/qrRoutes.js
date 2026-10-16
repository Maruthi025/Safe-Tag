const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

// GET /api/qr — public endpoint to get the QR code for the public website
router.get('/', qrController.getQRCode);

module.exports = router;
