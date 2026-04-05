import request from 'supertest';
import app from '../src/app.js';
import { sequelize, initializeDatabase } from '../src/db/index.js';

let adminToken;
let viewerToken;
let analystToken;

beforeAll(async () => {
  sequelize.options.storage = ':memory:';
  await sequelize.authenticate();
  await initializeDatabase();

  // Helper to login and extract token
  const getToken = async (email) => {
    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    });
    return res.body.data.token;
  };

  adminToken = await getToken('admin@example.com');
  viewerToken = await getToken('viewer@example.com');
  analystToken = await getToken('analyst@example.com');
});

afterAll(async () => {
  await sequelize.close();
});

describe('Financial Records API (RBAC)', () => {
  describe('GET /api/records', () => {
    it('Viewer can read records', async () => {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('Fails without authentication', async () => {
      const res = await request(app).get('/api/records');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/records', () => {
    const newRecord = {
      amount: 150.5,
      type: 'expense',
      category: 'testing',
    };

    it('Viewer CANNOT create records (returns 403)', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(newRecord);
      
      expect(res.statusCode).toBe(403);
    });

    it('Analyst CAN create records (returns 201)', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send(newRecord);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.amount).toBe(150.5); // Ensure float mapping works
    });

    it('Fails validation if amount is negative', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...newRecord, amount: -50 });
        
      expect(res.statusCode).toBe(400); // Bad Request from Joi
    });
  });

  describe('DELETE /api/records/:id', () => {
    it('Analyst CANNOT delete records (returns 403 restriction)', async () => {
      // Trying to delete record ID 1 (which exists from seeds)
      const res = await request(app)
        .delete('/api/records/1')
        .set('Authorization', `Bearer ${analystToken}`);
        
      expect(res.statusCode).toBe(403);
    });

    it('Admin CAN delete records', async () => {
      const res = await request(app)
        .delete('/api/records/1')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
