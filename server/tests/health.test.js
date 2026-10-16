const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  it('GET /api/health should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('GET /api/unknown should return 404', async () => {
    const res = await request(app).get('/api/unknown-route-xyz');
    expect(res.statusCode).toBe(404);
  });
});
