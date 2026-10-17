const crypto = require('crypto');
const { MATCH_REVIEW_STATUS } = require('../src/config/constants');

describe('Finder Report History & Owner Contact Authorization Rules', () => {
  const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

  it('should correctly verify high-entropy access token hash', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const storedHash = hashToken(rawToken);

    // Matching token produces identical hash
    expect(hashToken(rawToken)).toBe(storedHash);

    // Tampered token does not match
    const fakeToken = crypto.randomBytes(32).toString('hex');
    expect(hashToken(fakeToken)).not.toBe(storedHash);
  });

  it('should enforce Decision A and Decision B separation for calling authorization', () => {
    // Condition 1: Neither match approved nor phone consent
    let match = {
      reviewStatus: MATCH_REVIEW_STATUS.PENDING,
      phoneSharingConsent: false,
    };
    let canCallOwner = (
      match.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED &&
      match.phoneSharingConsent === true
    );
    expect(canCallOwner).toBe(false);

    // Condition 2: Match approved ONLY (Decision A confirmed, Decision B still false)
    match.reviewStatus = MATCH_REVIEW_STATUS.CONFIRMED;
    match.phoneSharingConsent = false;
    canCallOwner = (
      match.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED &&
      match.phoneSharingConsent === true
    );
    // CRITICAL REQUIREMENT: Approving match alone must NEVER enable calling!
    expect(canCallOwner).toBe(false);

    // Condition 3: Explicit phone sharing consent granted (Decision B confirmed)
    match.phoneSharingConsent = true;
    canCallOwner = (
      match.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED &&
      match.phoneSharingConsent === true
    );
    expect(canCallOwner).toBe(true);

    // Condition 4: Owner revokes consent
    match.phoneSharingConsent = false;
    canCallOwner = (
      match.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED &&
      match.phoneSharingConsent === true
    );
    expect(canCallOwner).toBe(false);

    // Condition 5: Match rejected
    match.reviewStatus = MATCH_REVIEW_STATUS.REJECTED;
    match.phoneSharingConsent = true; // even if stale flag was true
    canCallOwner = (
      match.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED &&
      match.phoneSharingConsent === true
    );
    expect(canCallOwner).toBe(false);
  });

  it('should invalidate calling when report status is closed or recovered', () => {
    const match = {
      reviewStatus: MATCH_REVIEW_STATUS.CONFIRMED,
      phoneSharingConsent: true,
    };

    const isCallable = (reportStatus) => (
      match.reviewStatus === MATCH_REVIEW_STATUS.CONFIRMED &&
      match.phoneSharingConsent === true &&
      reportStatus !== 'closed' &&
      reportStatus !== 'recovered'
    );

    expect(isCallable('waiting_for_owner_review')).toBe(true);
    expect(isCallable('owner_reviewing')).toBe(true);
    expect(isCallable('closed')).toBe(false);
    expect(isCallable('recovered')).toBe(false);
  });
});
