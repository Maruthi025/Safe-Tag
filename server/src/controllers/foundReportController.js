const crypto = require('crypto');
const FoundReport = require('../models/FoundReport');
const Match = require('../models/Match');
const User = require('../models/User');
const Item = require('../models/Item');
const AppError = require('../utils/AppError');
const { generateReportReference } = require('../utils/referenceGenerator');
const { runMatchingForFoundReport } = require('../services/matchingService');
const { MATCH_REVIEW_STATUS } = require('../config/constants');

// Helper to hash access token
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Public: Create a found report
 */
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
      phoneSharingConsent,
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

    // High entropy 32-byte secret access token for finder
    const rawAccessToken = crypto.randomBytes(32).toString('hex');
    const accessTokenHash = hashToken(rawAccessToken);

    const reportReference = generateReportReference();

    const finderPhoneConsent = phoneSharingConsent !== false && phoneSharingConsent !== 'false';

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
      finderConsent: {
        phoneSharingConsent: finderPhoneConsent,
        consentedAt: new Date(),
      },
      accessTokenHash,
      deviceLocationShared: locationShared,
      deviceLocation,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      additionalNotes,
      status: 'waiting_for_owner_review',
    });

    // Run matching asynchronously
    runMatchingForFoundReport(foundReport).catch(console.error);

    res.status(201).json({
      status: 'success',
      data: {
        reportReference: foundReport.reportReference,
        accessToken: rawAccessToken,
        report: {
          reportReference: foundReport.reportReference,
          category: foundReport.category,
          description: foundReport.description,
          status: foundReport.status,
          createdAt: foundReport.createdAt,
        },
        message: 'Your found item report has been submitted. Thank you for helping!',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public lookup of report status and contact options using accessToken or reference
 */
exports.getFoundReportByToken = async (req, res, next) => {
  try {
    const { ref } = req.params;
    const token = req.headers['x-finder-token'] || req.query.token;

    const query = { reportReference: ref };
    if (token) {
      query.accessTokenHash = hashToken(token);
    }

    const report = await FoundReport.findOne(query);
    if (!report) {
      return next(new AppError('Found report not found or invalid access token.', 404));
    }

    // Find matches for this found report, prioritizing confirmed matches with phone consent
    const matches = await Match.find({ foundReportId: report._id }).populate('lostReportId');
    const match = matches.find(m => m.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED && m.phoneSharingConsent)
      || matches.find(m => m.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED)
      || matches.find(m => m.reviewStatus === MATCH_REVIEW_STATUS.PENDING)
      || matches[0] || null;

    const hasMatch = !!match;
    const isMatchApproved = match?.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED;
    const isPhoneSharingAuthorized = isMatchApproved && match?.phoneSharingConsent === true;

    // Build safe response without leaking raw owner telephone
    res.status(200).json({
      status: 'success',
      data: {
        report: {
          _id: report._id,
          reportReference: report.reportReference,
          category: report.category,
          description: report.description,
          brand: report.brand,
          color: report.color,
          identifyingFeatures: report.identifyingFeatures,
          manualFoundLocation: report.manualFoundLocation,
          foundAt: report.foundAt,
          status: report.status,
          createdAt: report.createdAt,
        },
        hasMatch,
        matchScore: match?.matchScore || null,
        reviewStatus: match?.reviewStatus || 'pending',
        isMatchApproved,
        phoneSharingConsent: match?.phoneSharingConsent || false,
        canCallOwner: isPhoneSharingAuthorized && report.status !== 'closed' && report.status !== 'recovered',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Protected: Retrieve authorized owner contact phone number for direct calling
 * REQUIRES: valid report token + Match approved + Explicit phoneSharingConsent = true + Report not closed
 */
exports.getOwnerContactForCall = async (req, res, next) => {
  try {
    const { ref } = req.params;
    const token = req.headers['x-finder-token'] || req.query.token;

    if (!token) {
      return next(new AppError('Access token is required to request owner contact.', 401));
    }

    const report = await FoundReport.findOne({
      reportReference: ref,
      accessTokenHash: hashToken(token),
    });

    if (!report) {
      return next(new AppError('Invalid report reference or unauthorized access token.', 403));
    }

    if (report.status === 'closed') {
      return next(new AppError('This report is closed. Contact sharing is no longer accessible.', 403));
    }

    // Find approved match with phone sharing consent
    let match = await Match.findOne({
      foundReportId: report._id,
      reviewStatus: MATCH_REVIEW_STATUS.CONFIRMED,
      phoneSharingConsent: true,
    });
    if (!match) {
      match = await Match.findOne({ foundReportId: report._id });
    }
    if (!match) {
      return next(new AppError('No match associated with this report.', 404));
    }

    // Verify Match Approved AND Explicit Phone Sharing Consent
    if (match.reviewStatus !== MATCH_REVIEW_STATUS.CONFIRMED) {
      return next(new AppError('The owner has not approved this match yet.', 403));
    }

    if (!match.phoneSharingConsent) {
      return next(new AppError('The owner has not authorized phone number sharing.', 403));
    }

    // Get owner details
    const item = await Item.findById(match.itemId);
    if (!item) {
      return next(new AppError('Item not found.', 404));
    }

    const owner = await User.findById(item.ownerId);
    if (!owner || !owner.phone) {
      return next(new AppError('Owner contact telephone is not available on file.', 404));
    }

    // Return the authorized telephone number
    res.status(200).json({
      status: 'success',
      data: {
        ownerName: owner.name,
        phone: owner.phone,
        telLink: `tel:${owner.phone.replace(/\s+/g, '')}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Batch lookup of finder's submitted reports using an array of tokens
 */
exports.getMyReportsBatch = async (req, res, next) => {
  try {
    const { tokens } = req.body; // Array of { ref, token }
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(200).json({ status: 'success', data: { reports: [] } });
    }

    // Limit batch to max 50 items
    const boundedTokens = tokens.slice(0, 50);

    const conditions = boundedTokens.map(t => ({
      reportReference: t.ref,
      accessTokenHash: hashToken(t.token),
    }));

    const foundReports = await FoundReport.find({ $or: conditions })
      .select('reportReference category description color brand manualFoundLocation foundAt status createdAt')
      .sort({ createdAt: -1 });

    const reportIds = foundReports.map(r => r._id);
    const matches = await Match.find({ foundReportId: { $in: reportIds } });
    const matchMap = {};
    matches.forEach(m => {
      const id = m.foundReportId.toString();
      const existing = matchMap[id];
      if (!existing) {
        matchMap[id] = m;
      } else {
        const getPriority = (x) => (
          x.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED
            ? (x.phoneSharingConsent ? 3 : 2)
            : (x.reviewStatus === MATCH_REVIEW_STATUS.PENDING ? 1 : 0)
        );
        if (getPriority(m) > getPriority(existing)) {
          matchMap[id] = m;
        }
      }
    });

    const enrichedReports = foundReports.map(r => {
      const match = matchMap[r._id.toString()];
      const isMatchApproved = match?.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED;
      const canCallOwner = isMatchApproved && match?.phoneSharingConsent === true && r.status !== 'closed' && r.status !== 'recovered';

      return {
        _id: r._id,
        reportReference: r.reportReference,
        category: r.category,
        description: r.description,
        brand: r.brand,
        color: r.color,
        manualFoundLocation: r.manualFoundLocation,
        foundAt: r.foundAt,
        status: r.status,
        createdAt: r.createdAt,
        hasMatch: !!match,
        reviewStatus: match?.reviewStatus || 'pending',
        isMatchApproved: !!isMatchApproved,
        phoneSharingConsent: match?.phoneSharingConsent || false,
        canCallOwner,
      };
    });

    res.status(200).json({
      status: 'success',
      results: enrichedReports.length,
      data: { reports: enrichedReports },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: check basic status by reference (legacy backwards compatibility)
 */
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

/**
 * Protected: list all found reports for system admin / authorized owners
 */
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

/**
 * Protected: get single found report with full details
 */
exports.getFoundReport = async (req, res, next) => {
  try {
    const report = await FoundReport.findById(req.params.id);
    if (!report) return next(new AppError('Found report not found.', 404));
    res.status(200).json({ status: 'success', data: { report } });
  } catch (error) {
    next(error);
  }
};
