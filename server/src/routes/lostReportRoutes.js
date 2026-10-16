const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const lostReportController = require('../controllers/lostReportController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

// All lost report routes require authentication
router.use(authenticate);

// GET /api/lost-reports
router.get('/', lostReportController.getLostReports);

// POST /api/lost-reports
router.post(
  '/',
  upload.single('additionalPhoto'),
  [
    body('itemId').notEmpty().withMessage('Item ID is required').isMongoId().withMessage('Invalid item ID'),
    body('lostAt').notEmpty().withMessage('Lost date/time is required').isISO8601().withMessage('Invalid date format'),
    body('lastKnownLocation').optional().trim().isLength({ max: 500 }),
    body('description').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  lostReportController.createLostReport
);

// GET /api/lost-reports/:id
router.get('/:id', lostReportController.getLostReport);

// PATCH /api/lost-reports/:id/status
router.patch(
  '/:id/status',
  [
    body('status').notEmpty().withMessage('Status is required'),
  ],
  validate,
  lostReportController.updateLostReportStatus
);

module.exports = router;
