const FoundReport = require('../models/FoundReport');
const AppError = require('../utils/AppError');
const { generateReportReference } = require('../utils/referenceGenerator');
const { runMatchingForFoundReport } = require('../services/matchingService');

exports.createFoundReport = async (req, res, next) => {
  try {
    const {
      category,
      description,
      brand,
      color,
      identifyingFeatures,
      foundAt,
      manualFoundLocation,
      finderName,
      finderPhone,
      finderEmail,
      deviceLocationShared,
      deviceLat,
      deviceLng,
      deviceAccuracy,
      additionalNotes,
    } = req.body;

    // Validate at least one contact method
    if (!finderPhone && !finderEmail) {
      return next(new AppError('Please provide at least one contact method (phone or email).', 400));
    }

    const locationShared = deviceLocationShared === 'true' || deviceLocationShared === true;
    let deviceLocation = null;
    if (locationShared && deviceLat && deviceLng) {
      deviceLocation = {
        lat: parseFloat(deviceLat),
        lng: parseFloat(deviceLng),
        accuracy: deviceAccuracy ? parseFloat(deviceAccuracy) : undefined,
        capturedAt: new Date(),
      };
    }

    const reportReference = generateReportReference();

    const foundReport = await FoundReport.create({
      reportReference,
      category,
      description,
      brand,
      color,
      identifyingFeatures,
      foundAt: foundAt ? new Date(foundAt) : undefined,
      manualFoundLocation,
      finderName,
      finderContact: {
        phone: finderPhone,
        email: finderEmail,
      },
      deviceLocationShared: locationShared,
      deviceLocation,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      additionalNotes,
    });

    // Run matching asynchronously
    runMatchingForFoundReport(foundReport).catch(console.error);

    // Return reference without exposing other users' data
    res.status(201).json({
      status: 'success',
      data: {
        reportReference: foundReport.reportReference,
        message: 'Your found item report has been submitted. Thank you for helping!',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getFoundReportStatus = async (req, res, next) => {
  try {
    const report = await FoundReport.findOne(
      { reportReference: req.params.ref },
      'reportReference status createdAt category'
    );
    if (!report) return next(new AppError('Report not found.', 404));
    res.status(200).json({ status: 'success', data: { report } });
  } catch (error) {
    next(error);
  }
};

exports.getFoundReports = async (req, res, next) => {
  try {
    const foundReports = await FoundReport.find()
      .select('-finderContact -deviceLocation')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ status: 'success', results: foundReports.length, data: { foundReports } });
  } catch (error) {
    next(error);
  }
};

exports.getFoundReport = async (req, res, next) => {
  try {
    const report = await FoundReport.findById(req.params.id);
    if (!report) return next(new AppError('Found report not found.', 404));
    res.status(200).json({ status: 'success', data: { report } });
  } catch (error) {
    next(error);
  }
};
