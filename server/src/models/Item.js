const mongoose = require('mongoose');
const { ITEM_STATUS, ITEM_CATEGORIES } = require('../config/constants');

const itemSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [150, 'Item name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ITEM_CATEGORIES,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand cannot exceed 100 characters'],
    },
    color: {
      type: String,
      trim: true,
      maxlength: [50, 'Color cannot exceed 50 characters'],
    },
    identifyingFeatures: {
      type: String,
      trim: true,
      maxlength: [500, 'Identifying features cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
    },
    serialNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Serial number cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: Object.values(ITEM_STATUS),
      default: ITEM_STATUS.REGISTERED,
    },
  },
  { timestamps: true }
);

const VALID_TRANSITIONS = {
  registered: ['lost', 'archived'],
  lost: ['found_report_received', 'recovered', 'archived'],
  found_report_received: ['recovery_in_progress', 'lost', 'archived'],
  recovery_in_progress: ['recovered', 'archived'],
  recovered: ['archived'],
  archived: [],
};

itemSchema.methods.canTransitionTo = function (newStatus) {
  return VALID_TRANSITIONS[this.status]?.includes(newStatus) ?? false;
};

module.exports = mongoose.model('Item', itemSchema);
