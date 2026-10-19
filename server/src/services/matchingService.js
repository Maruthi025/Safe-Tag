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
  FOUND_REPORT_STATUS,
  ITEM_STATUS,
} = require('../config/constants');

/**
 * Calculates keyword overlap ratio between two strings.
 */
const keywordOverlap = (str1 = '', str2 = '') => {
  if (!str1 || !str2) return 0;
  const words1 = Array.from(new Set(
    str1.toLowerCase().split(/\W+/).filter((w) => w.length > 1)
  ));
  const words2 = Array.from(new Set(
    str2.toLowerCase().split(/\W+/).filter((w) => w.length > 1)
  ));
  if (words1.length === 0 || words2.length === 0) return 0;
  let overlap = 0;
  words1.forEach((w) => {
    if (words2.some((w2) => w2 === w || (w.length >= 3 && w2.includes(w)) || (w2.length >= 3 && w.includes(w2)))) {
      overlap++;
    }
  });
  return overlap / Math.min(words1.length, words2.length);
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

  // Brand match (15 pts) or brand conflict rejection
  if (
    foundReport.brand &&
    item.brand &&
    foundReport.brand.trim() &&
    item.brand.trim()
  ) {
    const b1 = foundReport.brand.toLowerCase().trim();
    const b2 = item.brand.toLowerCase().trim();
    if (b1 === b2 || b1.includes(b2) || b2.includes(b1)) {
      score += MATCH_WEIGHTS.BRAND;
      reasons.push({
        field: 'brand',
        weight: MATCH_WEIGHTS.BRAND,
        detail: `Brand matches: ${item.brand}`,
      });
    } else {
      // Direct brand conflict (e.g., Apple vs Samsung/Android)
      // Conflicting brands should never be matched
      return {
        score: 0,
        reasons: [{ field: 'brand_conflict', weight: 0, detail: `Different brand: ${foundReport.brand} vs ${item.brand}` }],
        category: MATCH_CATEGORY.NO_MATCH,
      };
    }
  }

  // Cross-ecosystem conflict check in text (e.g. iPhone/Apple vs Samsung/Android)
  const fullFoundText = `${foundReport.brand || ''} ${foundReport.description || ''}`.toLowerCase();
  const fullItemText = `${item.brand || ''} ${item.name || ''} ${item.description || ''}`.toLowerCase();
  const isFoundApple = fullFoundText.includes('iphone') || fullFoundText.includes('apple') || fullFoundText.includes('ios');
  const isFoundAndroid = fullFoundText.includes('samsung') || fullFoundText.includes('android') || fullFoundText.includes('galaxy') || fullFoundText.includes('pixel') || fullFoundText.includes('oneplus');
  const isItemApple = fullItemText.includes('iphone') || fullItemText.includes('apple') || fullItemText.includes('ios');
  const isItemAndroid = fullItemText.includes('samsung') || fullItemText.includes('android') || fullItemText.includes('galaxy') || fullItemText.includes('pixel') || fullItemText.includes('oneplus');

  if ((isFoundApple && isItemAndroid) || (isFoundAndroid && isItemApple)) {
    return {
      score: 0,
      reasons: [{ field: 'ecosystem_conflict', weight: 0, detail: 'Cross-brand ecosystem conflict (Apple vs Android)' }],
      category: MATCH_CATEGORY.NO_MATCH,
    };
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
    // Only include genuinely active lost reports
    const activeLostReports = await LostReport.find({
      status: LOST_REPORT_STATUS.ACTIVE,
    }).populate('itemId');

    // Also include any items marked 'lost' by the owner that don't have an active LostReport yet
    const existingLostItemIds = activeLostReports.map(lr => (lr.itemId?._id || lr.itemId)?.toString()).filter(Boolean);
    const lostItemsWithoutReport = await Item.find({
      status: ITEM_STATUS.LOST,
      _id: { $nin: existingLostItemIds },
    });

    for (const lostItem of lostItemsWithoutReport) {
      let lr = await LostReport.findOne({ itemId: lostItem._id, status: LOST_REPORT_STATUS.ACTIVE });
      if (!lr) {
        lr = await LostReport.create({
          itemId: lostItem._id,
          ownerId: lostItem.ownerId,
          lostAt: new Date(),
          description: lostItem.description,
          status: LOST_REPORT_STATUS.ACTIVE,
        });
      }
      const populated = await LostReport.findById(lr._id).populate('itemId');
      activeLostReports.push(populated);
    }

    const matchPromises = activeLostReports.map(async (lostReport) => {
      const item = lostReport.itemId;
      if (!item) return;

      // Never match against items that are already in recovery, recovered, or archived
      if ([ITEM_STATUS.RECOVERY_IN_PROGRESS, ITEM_STATUS.RECOVERED, ITEM_STATUS.ARCHIVED].includes(item.status)) {
        return;
      }

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
      status: { $nin: ['recovered', 'closed', 'owner_reviewing'] },
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
