const Match = require('../models/Match');
const Item = require('../models/Item');
const LostReport = require('../models/LostReport');
const FoundReport = require('../models/FoundReport');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const {
  MATCH_REVIEW_STATUS,
  ITEM_STATUS,
  NOTIFICATION_TYPES,
  LOST_REPORT_STATUS,
  FOUND_REPORT_STATUS,
} = require('../config/constants');

exports.getMatches = async (req, res, next) => {
  try {
    // Get items owned by the user
    const userItems = await Item.find({ ownerId: req.user._id }).select('_id');
    const itemIds = userItems.map((i) => i._id);

    const matches = await Match.find({ itemId: { $in: itemIds } })
      .populate('foundReportId', 'reportReference category description color brand manualFoundLocation foundAt finderName status createdAt')
      .populate('lostReportId', 'lostAt lastKnownLocation description status')
      .populate('itemId', 'name category status imageUrl')
      .sort({ createdAt: -1, matchScore: -1 });

    res.status(200).json({ status: 'success', results: matches.length, data: { matches } });
  } catch (error) {
    next(error);
  }
};

exports.getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('foundReportId')
      .populate('lostReportId')
      .populate('itemId');

    if (!match) return next(new AppError('Match not found.', 404));

    // Authorization: verify item belongs to user
    const item = await Item.findOne({ _id: match.itemId, ownerId: req.user._id });
    if (!item) return next(new AppError('You are not authorized to view this match.', 403));

    const matchData = match.toObject();

    res.status(200).json({ status: 'success', data: { match: matchData } });
  } catch (error) {
    next(error);
  }
};

/**
 * DECISION A: Match review (confirm or reject match)
 * NOTE: Approving the match alone DOES NOT grant phone sharing consent.
 */
exports.reviewMatch = async (req, res, next) => {
  try {
    const { action } = req.body; // 'confirm' or 'reject'

    if (!['confirm', 'reject'].includes(action)) {
      return next(new AppError('Action must be confirm or reject.', 400));
    }

    const match = await Match.findById(req.params.id)
      .populate('itemId')
      .populate('lostReportId')
      .populate('foundReportId');

    if (!match) return next(new AppError('Match not found.', 404));

    const item = await Item.findOne({ _id: match.itemId._id, ownerId: req.user._id });
    if (!item) return next(new AppError('You are not authorized to review this match.', 403));

    if (match.reviewStatus !== MATCH_REVIEW_STATUS.PENDING) {
      return next(new AppError('This match has already been reviewed.', 400));
    }

    match.reviewedAt = new Date();

    if (action === 'confirm') {
      match.reviewStatus = MATCH_REVIEW_STATUS.CONFIRMED;
      // Phone sharing consent stays false by default until Decision B is explicitly made!
      await match.save();

      await Item.findByIdAndUpdate(item._id, { status: ITEM_STATUS.RECOVERY_IN_PROGRESS });
      await LostReport.findByIdAndUpdate(match.lostReportId._id, { status: LOST_REPORT_STATUS.MATCHED });
      await FoundReport.findByIdAndUpdate(match.foundReportId._id, { status: FOUND_REPORT_STATUS.OWNER_REVIEWING });

      await Notification.create({
        recipientUserId: req.user._id,
        type: NOTIFICATION_TYPES.RECOVERY_CONFIRMED,
        title: 'Match Confirmed — Recovery in Progress',
        message: `You confirmed a match for your ${item.name}. Recovery is now in progress. You can now optionally authorize contact sharing.`,
        relatedMatchId: match._id,
      });
    } else {
      match.reviewStatus = MATCH_REVIEW_STATUS.REJECTED;
      match.phoneSharingConsent = false;
      await match.save();

      await Item.findByIdAndUpdate(item._id, { status: ITEM_STATUS.LOST });
      await LostReport.findByIdAndUpdate(match.lostReportId._id, { status: LOST_REPORT_STATUS.ACTIVE });
      await FoundReport.findByIdAndUpdate(match.foundReportId._id, { status: 'waiting_for_owner_review' });

      await Notification.create({
        recipientUserId: req.user._id,
        type: NOTIFICATION_TYPES.MATCH_REJECTED,
        title: 'Match Rejected',
        message: `You marked the found report for ${item.name} as not a match.`,
        relatedMatchId: match._id,
      });
    }

    res.status(200).json({ status: 'success', data: { match } });
  } catch (error) {
    next(error);
  }
};

/**
 * DECISION B: Separate Owner Phone Sharing Consent (Grant / Revoke)
 * Strictly requires that the match is already CONFIRMED (approved).
 */
exports.updatePhoneSharingConsent = async (req, res, next) => {
  try {
    const { consent } = req.body; // boolean: true or false

    if (typeof consent !== 'boolean') {
      return next(new AppError('Consent must be a boolean value (true or false).', 400));
    }

    const match = await Match.findById(req.params.id)
      .populate('itemId')
      .populate('foundReportId');

    if (!match) return next(new AppError('Match not found.', 404));

    // Verify ownership
    const item = await Item.findOne({ _id: match.itemId._id, ownerId: req.user._id });
    if (!item) return next(new AppError('You are not authorized to update consent for this match.', 403));

    // Match MUST be approved first before consent can be granted
    if (match.reviewStatus !== MATCH_REVIEW_STATUS.CONFIRMED && consent === true) {
      return next(new AppError('You must approve the match before authorizing phone number sharing.', 400));
    }

    // Check if report or match is closed
    if (match.foundReportId?.status === 'closed') {
      return next(new AppError('Cannot update contact consent on a closed report.', 400));
    }

    if (consent === true) {
      match.phoneSharingConsent = true;
      match.phoneSharingConsentAt = new Date();
      match.phoneSharingRevokedAt = null;
      await match.save();

      await Notification.create({
        recipientUserId: req.user._id,
        type: NOTIFICATION_TYPES.CONTACT_SHARED,
        title: 'Phone Sharing Authorized',
        message: `You authorized phone number sharing with the finder for ${item.name}. Calling is now enabled for the finder.`,
        relatedMatchId: match._id,
      });
    } else {
      match.phoneSharingConsent = false;
      match.phoneSharingRevokedAt = new Date();
      await match.save();

      await Notification.create({
        recipientUserId: req.user._id,
        type: NOTIFICATION_TYPES.CONTACT_REVOKED,
        title: 'Phone Sharing Revoked',
        message: `You revoked phone number sharing for ${item.name}. Future calling access is now disabled.`,
        relatedMatchId: match._id,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        matchId: match._id,
        phoneSharingConsent: match.phoneSharingConsent,
        phoneSharingConsentAt: match.phoneSharingConsentAt,
        phoneSharingRevokedAt: match.phoneSharingRevokedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.markRecovered = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).populate('itemId');
    if (!match) return next(new AppError('Match not found.', 404));

    const item = await Item.findOne({ _id: match.itemId._id, ownerId: req.user._id });
    if (!item) return next(new AppError('Unauthorized.', 403));

    // Revoke calling permission upon final recovery
    match.phoneSharingConsent = false;
    match.phoneSharingRevokedAt = new Date();
    await match.save();

    await Item.findByIdAndUpdate(item._id, { status: ITEM_STATUS.RECOVERED });
    await LostReport.findByIdAndUpdate(match.lostReportId, { status: LOST_REPORT_STATUS.RECOVERED });
    await FoundReport.findByIdAndUpdate(match.foundReportId, { status: FOUND_REPORT_STATUS.RECOVERED });

    await Notification.create({
      recipientUserId: req.user._id,
      type: NOTIFICATION_TYPES.ITEM_RECOVERED,
      title: '🎉 Item Recovered!',
      message: `Your ${item.name} has been marked as recovered. Great news!`,
      relatedMatchId: match._id,
    });

    res.status(200).json({ status: 'success', message: 'Item marked as recovered.' });
  } catch (error) {
    next(error);
  }
};
