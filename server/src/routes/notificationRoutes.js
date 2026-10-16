const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');

// All notification routes require authentication
router.use(authenticate);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// PATCH /api/notifications/read-all
router.patch('/read-all', notificationController.markAllRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
