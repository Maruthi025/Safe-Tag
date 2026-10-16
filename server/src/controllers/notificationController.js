const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientUserId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      recipientUserId: req.user._id,
      readAt: null,
    });
    res.status(200).json({
      status: 'success',
      data: { notifications, unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientUserId: req.user._id,
    });
    if (!notification) return next(new AppError('Notification not found.', 404));
    notification.readAt = new Date();
    await notification.save();
    res.status(200).json({ status: 'success', data: { notification } });
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientUserId: req.user._id, readAt: null },
      { readAt: new Date() }
    );
    res.status(200).json({ status: 'success', message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};
