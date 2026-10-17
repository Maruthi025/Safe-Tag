const mongoose = require('mongoose');
const { FOUND_REPORT_STATUS, ITEM_CATEGORIES } = require('../config/constants');

const deviceLocationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number },
    capturedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const finderContactSchema = new mongoose.Schema(
  {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

const foundReportSchema = new mongoose.Schema(
  {
    reportReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    foundAt: {
      type: Date,
    },
    manualFoundLocation: {
      type: String,
      trim: true,
      maxlength: [500, 'Location cannot exceed 500 characters'],
    },
    finderName: {
      type: String,
      required: [true, 'Finder name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    finderContact: {
      type: finderContactSchema,
      required: true,
    },
    deviceLocationShared: {
      type: Boolean,
      default: false,
    },
    deviceLocation: {
      type: deviceLocationSchema,
      default: null,
    },
    imageUrl: {
      type: String,
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: Object.values(FOUND_REPORT_STATUS),
      default: FOUND_REPORT_STATUS.WAITING_FOR_OWNER_REVIEW,
    },
    accessTokenHash: {
      type: String,
      index: true,
      select: false, // Never return raw or hash in standard queries unless selected
    },
    finderConsent: {
      phoneSharingConsent: {
        type: Boolean,
        default: true, // Finder consenting to share contact with verified owner
      },
      consentedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoundReport', foundReportSchema);
