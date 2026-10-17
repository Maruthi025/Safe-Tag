const LostReport = require('../models/LostReport');
const FoundReport = require('../models/FoundReport');
const Item = require('../models/Item');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const {
  MATCH_WEIGHTS,
  MATCH_THRESHOLDS,
  MATCH_CATEGORY,
  MATCH_REVIEW_STATUS,
  NOTIFICATION_TYPES,
  LOST_REPORT_STATUS,
  ITEM_STATUS,
} = require('../config/constants');

/**
 * Calculates keyword overlap ratio between two strings.
 */
const keywordOverlap = (str1 = '', str2 = '') => {
  if (!str1 || !str2) return 0;
  const words1 = new Set(
    str1.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
  );
  const words2 = new Set(
    str2.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
  );
  if (words1.size === 0 || words2.size === 0) return 0;
  let overlap = 0;
  words1.forEach((w) => { if (words2.has(w)) overlap++; });
  return overlap / Math.min(words1.size, words2.size);
};

/**
 * Computes a match score between a found report and a lost report/item.
 * Returns { score, reasons, category }
 */
const computeMatchScore = (foundReport, lostReport, item) => {
  let score = 0;
  const reasons = [];

  // Category match (30 pts)
  if (
    foundReport.category &&
    item.category &&
    foundReport.category.toLowerCase() === item.category.toLowerCase()
  ) {
    score += MATCH_WEIGHTS.CATEGORY;
    reasons.push({
      field: 'category',
      weight: MATCH_WEIGHTS.CATEGORY,
      detail: `Category matches: ${item.category}`,
    });
  }

  // Description similarity (25 pts)
  const descOverlap = keywordOverlap(
    foundReport.description,
    `${item.description} ${lostReport.description || ''}`
  );
  if (descOverlap >= 0.5) {
    const pts = Math.round(MATCH_WEIGHTS.DESCRIPTION * descOverlap);
    score += pts;
    reasons.push({
      field: 'description',
      weight: pts,
      detail: `Description has ${Math.round(descOverlap * 100)}% keyword overlap`,
    });
  } else if (descOverlap > 0.2) {
    const pts = Math.round(MATCH_WEIGHTS.DESCRIPTION * descOverlap * 0.5);
    score += pts;
    reasons.push({
      field: 'description',
      weight: pts,
      detail: `Description has partial keyword overlap (${Math.round(descOverlap * 100)}%)`,
    });
  }

  // Brand match (15 pts)
  if (
    foundReport.brand &&
    item.brand &&
    foundReport.brand.toLowerCase().trim() === item.brand.toLowerCase().trim()
  ) {
    score += MATCH_WEIGHTS.BRAND;
    reasons.push({
      field: 'brand',
      weight: MATCH_WEIGHTS.BRAND,
      detail: `Brand matches: ${item.brand}`,
    });
  }

  // Identifying features (15 pts)
  const featuresOverlap = keywordOverlap(
    foundReport.identifyingFeatures,
    item.identifyingFeatures
  );
  if (featuresOverlap >= 0.4) {
    const pts = Math.round(MATCH_WEIGHTS.IDENTIFYING_FEATURES * featuresOverlap);
    score += pts;
    reasons.push({
      field: 'identifyingFeatures',
      weight: pts,
      detail: `Identifying features overlap (${Math.round(featuresOverlap * 100)}%)`,
    });
  }

  // Color match (10 pts)
  if (
    foundReport.color &&
    item.color &&
    foundReport.color.toLowerCase().trim() === item.color.toLowerCase().trim()
  ) {
    score += MATCH_WEIGHTS.COLOR;
    reasons.push({
      field: 'color',
      weight: MATCH_WEIGHTS.COLOR,
      detail: `Color matches: ${item.color}`,
    });
  }

  // Date proximity (5 pts) - found date after lost date, within 30 days
  if (foundReport.foundAt && lostReport.lostAt) {
    const diffDays =
      (new Date(foundReport.foundAt) - new Date(lostReport.lostAt)) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 7) {
      score += MATCH_WEIGHTS.DATE_PROXIMITY;
      reasons.push({
        field: 'date',
        weight: MATCH_WEIGHTS.DATE_PROXIMITY,
        detail: `Item found within ${Math.round(diffDays)} days of reported loss`,
      });
    } else if (diffDays >= 0 && diffDays <= 30) {
      const pts = Math.round(MATCH_WEIGHTS.DATE_PROXIMITY * 0.5);
      score += pts;
      reasons.push({
        field: 'date',
        weight: pts,
        detail: `Item found within ${Math.round(diffDays)} days of reported loss`,
      });
    }
  }

  let category;
  if (score >= MATCH_THRESHOLDS.STRONG) {
    category = MATCH_CATEGORY.STRONG_POSSIBLE;
  } else if (score >= MATCH_THRESHOLDS.POSSIBLE) {
    category = MATCH_CATEGORY.POSSIBLE;
  } else {
    category = MATCH_CATEGORY.NO_MATCH;
  }

  return { score: Math.min(score, 100), reasons, category };
};

/**
 * Runs matching for a given found report against all active lost reports.
 * Creates Match documents and notifications for qualifying matches.
 */
const runMatchingForFoundReport = async (foundReport) => {
  try {
    const activeLostReports = await LostReport.find({
      status: LOST_REPORT_STATUS.ACTIVE,
    }).populate('itemId');

    const matchPromises = activeLostReports.map(async (lostReport) => {
      const item = lostReport.itemId;
      if (!item) return;

      const { score, reasons, category } = computeMatchScore(foundReport, lostReport, item);

      if (category === MATCH_CATEGORY.NO_MATCH) return;

      // Avoid duplicate matches
      const existing = await Match.findOne({
        foundReportId: foundReport._id,
        lostReportId: lostReport._id,
      });
      if (existing) return;

      const match = await Match.create({
        foundReportId: foundReport._id,
        lostReportId: lostReport._id,
        itemId: item._id,
        matchScore: score,
        matchReasons: reasons,
        matchCategory: category,
        reviewStatus: MATCH_REVIEW_STATUS.PENDING,
      });

      // Update statuses
      await FoundReport.findByIdAndUpdate(foundReport._id, { status: 'matched' });
      await LostReport.findByIdAndUpdate(lostReport._id, { status: LOST_REPORT_STATUS.MATCHED });
      await Item.findByIdAndUpdate(item._id, { status: ITEM_STATUS.FOUND_REPORT_RECEIVED });

      // Notify owner
      await Notification.create({
        recipientUserId: lostReport.ownerId,
        type: NOTIFICATION_TYPES.MATCH_FOUND,
        title: 'Possible Match Found!',
        message: `A found item report may match your lost ${item.name}. Score: ${score}/100. Please review the details.`,
        relatedReportId: foundReport._id,
        relatedMatchId: match._id,
      });

      return match;
    });

    await Promise.all(matchPromises);
  } catch (error) {
    console.error('Matching service error:', error.message);
  }
};

/**
 * Runs matching for a newly created lost report against existing found reports.
 */
const runMatchingForLostReport = async (lostReport, item) => {
  try {
    const pendingFoundReports = await FoundReport.find({
      status: { $in: ['pending', FOUND_REPORT_STATUS.WAITING_FOR_OWNER_REVIEW, 'waiting_for_owner_review'] },
    });

    const matchPromises = pendingFoundReports.map(async (foundReport) => {
      const { score, reasons, category } = computeMatchScore(foundReport, lostReport, item);

      if (category === MATCH_CATEGORY.NO_MATCH) return;

      const existing = await Match.findOne({
        foundReportId: foundReport._id,
        lostReportId: lostReport._id,
      });
      if (existing) return;

      const match = await Match.create({
        foundReportId: foundReport._id,
        lostReportId: lostReport._id,
        itemId: item._id,
        matchScore: score,
        matchReasons: reasons,
        matchCategory: category,
        reviewStatus: MATCH_REVIEW_STATUS.PENDING,
      });

      await FoundReport.findByIdAndUpdate(foundReport._id, { status: 'matched' });
      await LostReport.findByIdAndUpdate(lostReport._id, { status: LOST_REPORT_STATUS.MATCHED });
      await Item.findByIdAndUpdate(item._id, { status: ITEM_STATUS.FOUND_REPORT_RECEIVED });

      await Notification.create({
        recipientUserId: lostReport.ownerId,
        type: NOTIFICATION_TYPES.MATCH_FOUND,
        title: 'Possible Match Found!',
        message: `An existing found report may match your lost ${item.name}. Score: ${score}/100. Please review.`,
        relatedReportId: foundReport._id,
        relatedMatchId: match._id,
      });

      return match;
    });

    await Promise.all(matchPromises);
  } catch (error) {
    console.error('Matching service (lost report) error:', error.message);
  }
};

module.exports = {
  computeMatchScore,
  runMatchingForFoundReport,
  runMatchingForLostReport,
};
