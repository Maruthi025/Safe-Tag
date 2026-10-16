const crypto = require('crypto');

/**
 * Generates a unique human-readable found report reference number.
 * Format: ST-YYYYMMDD-XXXXXXXX (ST = Safe Tag)
 */
const generateReportReference = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ST-${datePart}-${randomPart}`;
};

module.exports = { generateReportReference };
