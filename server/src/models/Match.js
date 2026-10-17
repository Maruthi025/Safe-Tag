const mongoose = require('mongoose');
const { MATCH_CATEGORY, MATCH_REVIEW_STATUS } = require('../config/constants');

const matchReasonSchema = new mongoose.Schema(
  {
    field: { type: String },
    weight: { type: Number },
    detail: { type: String },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    foundReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundReport',
      required: true,
      index: true,
    },
    lostReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostReport',
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchReasons: [matchReasonSchema],
    matchCategory: {
      type: String,
      enum: Object.values(MATCH_CATEGORY),
      required: true,
    },
    reviewStatus: {
      type: String,
      enum: Object.values(MATCH_REVIEW_STATUS),
      default: MATCH_REVIEW_STATUS.PENDING,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    // Decision B: Distinct phone-number-sharing consent
    phoneSharingConsent: {
      type: Boolean,
      default: false, // Explicitly false by default!
    },
    phoneSharingConsentAt: {
      type: Date,
      default: null,
    },
    phoneSharingRevokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
