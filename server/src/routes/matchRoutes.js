const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const matchController = require('../controllers/matchController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

// All match routes require authentication
router.use(authenticate);

// GET /api/matches
router.get('/', matchController.getMatches);

// GET /api/matches/:id
router.get('/:id', matchController.getMatch);

// POST & PATCH /api/matches/:id/review (Decision A: Match Approval)
router
  .route('/:id/review')
  .post(
    [
      body('action')
        .isIn(['confirm', 'reject'])
        .withMessage('Action must be either confirm or reject'),
    ],
    validate,
    matchController.reviewMatch
  )
  .patch(
    [
      body('action')
        .isIn(['confirm', 'reject'])
        .withMessage('Action must be either confirm or reject'),
    ],
    validate,
    matchController.reviewMatch
  );

// POST & PATCH /api/matches/:id/phone-consent (Decision B: Separate Phone Sharing Consent)
router
  .route('/:id/phone-consent')
  .post(
    [
      body('consent')
        .isBoolean()
        .withMessage('Consent must be a boolean value'),
    ],
    validate,
    matchController.updatePhoneSharingConsent
  )
  .patch(
    [
      body('consent')
        .isBoolean()
        .withMessage('Consent must be a boolean value'),
    ],
    validate,
    matchController.updatePhoneSharingConsent
  );

// POST & PATCH /api/matches/:id/recover
router
  .route('/:id/recover')
  .post(matchController.markRecovered)
  .patch(matchController.markRecovered);

module.exports = router;
