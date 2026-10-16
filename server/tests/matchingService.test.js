const { computeMatchScore } = require('../src/services/matchingService');
const { MATCH_CATEGORY } = require('../src/config/constants');

describe('computeMatchScore', () => {
  const baseFoundReport = {
    category: 'Mobile Phone',
    description: 'black samsung galaxy s21 smartphone',
    brand: 'Samsung',
    color: 'Black',
    identifyingFeatures: 'cracked screen protector',
    foundAt: new Date('2024-06-05'),
  };

  const baseLostReport = {
    description: 'lost my samsung phone',
    lostAt: new Date('2024-06-03'),
  };

  const baseItem = {
    category: 'Mobile Phone',
    description: 'Samsung Galaxy S21 black smartphone',
    brand: 'Samsung',
    color: 'Black',
    identifyingFeatures: 'cracked screen protector on front',
  };

  it('should score STRONG_POSSIBLE for a very similar item', () => {
    const { score, category } = computeMatchScore(baseFoundReport, baseLostReport, baseItem);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(category).toBe(MATCH_CATEGORY.STRONG_POSSIBLE);
  });

  it('should score NO_MATCH for completely different items', () => {
    const foundReport = {
      category: 'Laptop',
      description: 'silver dell laptop',
      brand: 'Dell',
      color: 'Silver',
    };
    const lostReport = { description: 'lost my keys' };
    const item = { category: 'Keys', description: 'house keys', brand: '', color: 'Silver' };

    const { category } = computeMatchScore(foundReport, lostReport, item);
    expect(category).toBe(MATCH_CATEGORY.NO_MATCH);
  });

  it('should award date proximity bonus for item found within 7 days', () => {
    const { score: scoreClose } = computeMatchScore(
      { ...baseFoundReport, foundAt: new Date('2024-06-05') },
      { ...baseLostReport, lostAt: new Date('2024-06-03') },
      baseItem
    );
    const { score: scoreFar } = computeMatchScore(
      { ...baseFoundReport, foundAt: new Date('2024-07-10') },
      { ...baseLostReport, lostAt: new Date('2024-06-03') },
      baseItem
    );
    expect(scoreClose).toBeGreaterThan(scoreFar);
  });

  it('should never exceed 100', () => {
    const { score } = computeMatchScore(baseFoundReport, baseLostReport, baseItem);
    expect(score).toBeLessThanOrEqual(100);
  });
});
