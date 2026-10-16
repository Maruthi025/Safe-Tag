const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const itemController = require('../controllers/itemController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { ITEM_CATEGORIES, ITEM_STATUS } = require('../config/constants');

// All item routes require authentication
router.use(authenticate);

// GET /api/items/stats
router.get('/stats', itemController.getDashboardStats);
router.get('/stats/dashboard', itemController.getDashboardStats);

// GET /api/items
router.get('/', itemController.getItems);

// POST /api/items
router.post(
  '/',
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Item name is required').isLength({ max: 150 }),
    body('category').isIn(ITEM_CATEGORIES).withMessage('Invalid category'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 1000 }),
    body('brand').optional().trim().isLength({ max: 100 }),
    body('color').optional().trim().isLength({ max: 50 }),
    body('identifyingFeatures').optional().trim().isLength({ max: 500 }),
    body('serialNumber').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  itemController.createItem
);

// GET /api/items/:id
router.get('/:id', itemController.getItem);

// PUT /api/items/:id
router.put(
  '/:id',
  upload.single('image'),
  [
    body('name').optional().trim().notEmpty().isLength({ max: 150 }),
    body('category').optional().isIn(ITEM_CATEGORIES).withMessage('Invalid category'),
    body('description').optional().trim().notEmpty().isLength({ max: 1000 }),
    body('brand').optional().trim().isLength({ max: 100 }),
    body('color').optional().trim().isLength({ max: 50 }),
    body('identifyingFeatures').optional().trim().isLength({ max: 500 }),
    body('serialNumber').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  itemController.updateItem
);

// PATCH /api/items/:id/status
router.patch(
  '/:id/status',
  [
    body('status')
      .isIn(Object.values(ITEM_STATUS))
      .withMessage('Invalid status value'),
  ],
  validate,
  itemController.updateItemStatus
);

// DELETE /api/items/:id (soft-archive)
router.delete('/:id', itemController.archiveItem);

module.exports = router;
