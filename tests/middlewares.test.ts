import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../src/app';
import database from '../src/services/database';
import { Error } from '../src/types';
import env from '../src/utils/env';

// Test cases that are not tested in common routes
describe('Test middlewares', () => {
  after(async () => {
    await database.vendor.deleteMany();
  });

  describe('Test general middleware', () => {
    it('should return a not found error', () =>
      request(app).get('/randomRoute').expect(404, { error: Error.RouteNotFound }));
  });

  describe('Test JSON middleware', () => {
    it('should not accept incorrect media type (sending text/plain)', async () => {
      await request(app)
        .post('/vendors/login')
        .send('mange tes morts')
        .expect(415, { error: Error.UnsupportedMediaType });
    });

    it('should not accept incorrect json type', async () => {
      await request(app)
        .post('/vendors/login')
        .send('mange tes morts')
        .set('Content-Type', 'application/json')
        .expect(400, { error: Error.MalformedBody });
    });
  });

  describe('Test authentication middleware', () => {
    it("should reject a wrong token because it's invalid", async () => {
      const token = jwt.sign({ vendorId: 'A1B2C3' }, 'otherSecret', {
        expiresIn: env.jwt.expires,
      });

      await request(app)
        .get('/')
        .set('Authorization', `Bearer ${token}`)
        .expect(401, { error: Error.InvalidToken });
    });

    it("should reject a wrong token because it's expired", async () => {
      const token = jwt.sign({ vendorId: 'A1B2C3' }, env.jwt.secret, {
        expiresIn: '1ms',
      });

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          request(app)
            .get('/')
            .set('Authorization', `Bearer ${token}`)
            .expect(401, { error: Error.ExpiredToken })
            .then(resolve)
            .catch(reject);
        }, 5);
      });
    });
  });
});
