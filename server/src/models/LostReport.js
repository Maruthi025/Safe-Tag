const mongoose = require('mongoose');
const { LOST_REPORT_STATUS } = require('../config/constants');

const lostReportSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lostAt: {
      type: Date,
      required: [true, 'Date/time lost is required'],
    },
    lastKnownLocation: {
      type: String,
      trim: true,
      maxlength: [500, 'Location cannot exceed 500 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    additionalPhotoUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(LOST_REPORT_STATUS),
      default: LOST_REPORT_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostReport', lostReportSchema);
