import request from 'supertest';
import app from '../src/app.js';
import { sequelize, initializeDatabase } from '../src/db/index.js';

beforeAll(async () => {
  // Use in-memory SQLite for tests to run fast and clean
  sequelize.options.storage = ':memory:';
  await sequelize.authenticate();
  await initializeDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Authentication API', () => {
  it('should reject login without email/password', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should login successfully as admin and return JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
  });

  it('should fetch profile with valid JWT', async () => {
    // 1. Get token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'viewer@example.com',
      password: 'password123',
    });
    const token = loginRes.body.data.token;

    // 2. Fetch Profile
    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.statusCode).toBe(200);
    expect(profileRes.body.data.email).toBe('viewer@example.com');
  });

  it('should reject profile fetch without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
  });
});
