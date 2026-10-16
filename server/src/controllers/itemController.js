const Item = require('../models/Item');
const LostReport = require('../models/LostReport');
const AppError = require('../utils/AppError');
const { ITEM_STATUS } = require('../config/constants');

exports.createItem = async (req, res, next) => {
  try {
    const { name, category, description, brand, color, identifyingFeatures, serialNumber } = req.body;
    const item = await Item.create({
      ownerId: req.user._id,
      name,
      category,
      description,
      brand,
      color,
      identifyingFeatures,
      serialNumber,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
    });
    res.status(201).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

exports.getItems = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = { ownerId: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: items.length, data: { items } });
  } catch (error) {
    next(error);
  }
};

exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!item) return next(new AppError('Item not found.', 404));
    res.status(200).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { name, category, description, brand, color, identifyingFeatures, serialNumber } = req.body;
    const item = await Item.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!item) return next(new AppError('Item not found.', 404));
    if (item.status === ITEM_STATUS.ARCHIVED) {
      return next(new AppError('Cannot update an archived item.', 400));
    }
    Object.assign(item, { name, category, description, brand, color, identifyingFeatures, serialNumber });
    if (req.file) item.imageUrl = `/uploads/${req.file.filename}`;
    await item.save();
    res.status(200).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

exports.updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await Item.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!item) return next(new AppError('Item not found.', 404));
    if (!item.canTransitionTo(status)) {
      return next(new AppError(`Cannot transition from '${item.status}' to '${status}'.`, 400));
    }
    item.status = status;
    await item.save();
    res.status(200).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

exports.archiveItem = async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!item) return next(new AppError('Item not found.', 404));
    item.status = ITEM_STATUS.ARCHIVED;
    await item.save();
    res.status(200).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const [total, lost, foundReportReceived, recoveryInProgress, recovered] = await Promise.all([
      Item.countDocuments({ ownerId }),
      Item.countDocuments({ ownerId, status: ITEM_STATUS.LOST }),
      Item.countDocuments({ ownerId, status: ITEM_STATUS.FOUND_REPORT_RECEIVED }),
      Item.countDocuments({ ownerId, status: ITEM_STATUS.RECOVERY_IN_PROGRESS }),
      Item.countDocuments({ ownerId, status: ITEM_STATUS.RECOVERED }),
    ]);
    res.status(200).json({
      status: 'success',
      data: { stats: { total, lost, foundReportReceived, recoveryInProgress, recovered } },
    });
  } catch (error) {
    next(error);
  }
};
