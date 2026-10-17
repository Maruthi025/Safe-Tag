const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const foundReportController = require('../controllers/foundReportController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { foundReportLimiter, contactAccessLimiter } = require('../middleware/rateLimiter');
const { ITEM_CATEGORIES } = require('../config/constants');

// POST /api/found-reports — public, rate-limited
router.post(
  '/',
  foundReportLimiter,
  upload.single('image'),
  [
    body('category').isIn(ITEM_CATEGORIES).withMessage('Invalid category'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 1000 }),
    body('brand').optional().trim().isLength({ max: 100 }),
    body('color').optional().trim().isLength({ max: 50 }),
    body('identifyingFeatures').optional().trim().isLength({ max: 500 }),
    body('finderName').trim().notEmpty().withMessage('Your name is required').isLength({ max: 100 }),
    body('finderPhone').optional().trim().isLength({ max: 20 }),
    body('finderEmail').optional().isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('additionalNotes').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  foundReportController.createFoundReport
);

// POST /api/found-reports/my-reports — public with token verification in request body
router.post('/my-reports', foundReportController.getMyReportsBatch);

// GET /api/found-reports/view/:ref — public with x-finder-token or ?token
router.get('/view/:ref', foundReportController.getFoundReportByToken);

// GET /api/found-reports/:ref/call-owner — protected contact retrieval for direct calling
router.get('/call-owner/:ref', contactAccessLimiter, foundReportController.getOwnerContactForCall);

// GET /api/found-reports/status/:ref — public, finder can look up basic report status
router.get('/status/:ref', foundReportController.getFoundReportStatus);

// Protected routes (authenticated users / admin)
router.use(authenticate);

// GET /api/found-reports — list all (admin/owner use)
router.get('/', foundReportController.getFoundReports);

// GET /api/found-reports/:id — get single with full details
router.get('/:id', foundReportController.getFoundReport);

module.exports = router;
