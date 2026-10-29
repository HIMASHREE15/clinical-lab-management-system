import request from 'supertest';
import app from '../src/app';

describe('Sample Lifecycle & State Machine Tests', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'tech@clinicallab.com',
      password: 'password123',
    });
    token = res.body.token;
  });

  it('should reject invalid sample status transition', async () => {
    // Attempting invalid jump from REGISTERED to DELIVERED
    const res = await request(app)
      .patch('/api/samples/SMP1005/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'DELIVERED' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid state transition');
  });

  it('should accept valid sample status transition from REGISTERED to COLLECTED', async () => {
    const res = await request(app)
      .patch('/api/samples/SMP1005/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COLLECTED', location: 'Phlebotomy Station' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sample.status).toBe('COLLECTED');
  });
});
