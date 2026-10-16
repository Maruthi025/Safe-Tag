const LostReport = require('../models/LostReport');
const Item = require('../models/Item');
const AppError = require('../utils/AppError');
const { ITEM_STATUS, LOST_REPORT_STATUS } = require('../config/constants');
const { runMatchingForLostReport } = require('../services/matchingService');

exports.createLostReport = async (req, res, next) => {
  try {
    const { itemId, lostAt, lastKnownLocation, description } = req.body;

    const item = await Item.findOne({ _id: itemId, ownerId: req.user._id });
    if (!item) return next(new AppError('Item not found or you do not own this item.', 404));

    if (item.status === ITEM_STATUS.ARCHIVED) {
      return next(new AppError('Cannot report an archived item as lost.', 400));
    }

    if (!item.canTransitionTo(ITEM_STATUS.LOST)) {
      return next(new AppError(`Item cannot be marked as lost from its current status: ${item.status}.`, 400));
    }

    const lostReport = await LostReport.create({
      itemId,
      ownerId: req.user._id,
      lostAt: new Date(lostAt),
      lastKnownLocation,
      description,
      additionalPhotoUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    item.status = ITEM_STATUS.LOST;
    await item.save();

    // Run matching asynchronously
    runMatchingForLostReport(lostReport, item).catch(console.error);

    res.status(201).json({ status: 'success', data: { lostReport } });
  } catch (error) {
    next(error);
  }
};

exports.getLostReports = async (req, res, next) => {
  try {
    const lostReports = await LostReport.find({ ownerId: req.user._id })
      .populate('itemId', 'name category status imageUrl')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: lostReports.length, data: { lostReports } });
  } catch (error) {
    next(error);
  }
};

exports.getLostReport = async (req, res, next) => {
  try {
    const lostReport = await LostReport.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    }).populate('itemId');
    if (!lostReport) return next(new AppError('Lost report not found.', 404));
    res.status(200).json({ status: 'success', data: { lostReport } });
  } catch (error) {
    next(error);
  }
};

exports.updateLostReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = Object.values(LOST_REPORT_STATUS);
    if (!allowedStatuses.includes(status)) {
      return next(new AppError('Invalid status value.', 400));
    }
    const lostReport = await LostReport.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });
    if (!lostReport) return next(new AppError('Lost report not found.', 404));
    lostReport.status = status;
    await lostReport.save();
    res.status(200).json({ status: 'success', data: { lostReport } });
  } catch (error) {
    next(error);
  }
};
