import request from 'supertest';
import app from '../src/app';

describe('Authentication & JWT API Tests', () => {
  it('should authenticate demo administrator user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@clinicallab.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('Administrator');
  });

  it('should reject login with invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@clinicallab.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
