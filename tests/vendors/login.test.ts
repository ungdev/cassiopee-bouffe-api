import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app';
import * as vendorUtils from '../../src/utils/vendor';
import { Error } from '../../src/types';
import database from '../../src/services/database';
import { sandbox } from '../setup';
import { createFakeVendor } from '../utils';

describe('POST /vendors/login', () => {
  const pin = '123456';
  let authorizationToken: string;

  before(() => createFakeVendor({ pin }));

  after(async () => {
    // Delete the vendor created
    await database.vendor.deleteMany();
  });

  it('should return an error as incorrect body', async () => {
    await request(app)
      .post('/vendors/login')
      .send({
        pin: '123',
      })
      .expect(400, { error: Error.InvalidBody });
  });

  it('should return an error as incorrect credentials', async () => {
    await request(app)
      .post('/vendors/login')
      .send({
        pin: '000000',
      })
      .expect(401, { error: Error.InvalidCredentials });
  });

  it('should throw an internal server error', async () => {
    // Fake the main function to throw
    sandbox.stub(vendorUtils, 'generateToken').throws('Unexpected error');

    // Request to login
    await request(app)
      .post('/vendors/login')
      .send({
        pin,
      })
      .expect(500, { error: Error.InternalServerError });
  });

  it('should validate the login', async () => {
    const response = await request(app)
      .post('/vendors/login')
      .send({
        pin,
      })
      .expect(200);

    expect(response.body.vendor).to.be.an('object');
    expect(response.body.token).to.be.a('string');

    authorizationToken = response.body.token;
  });

  it('should return a bad request because we are already authenticated', async () => {
    await request(app)
      .post('/vendors/login')
      .set('Authorization', `Bearer ${authorizationToken}`)
      .send({
        pin,
      })
      .expect(403, { error: Error.AlreadyAuthenticated });
  });
});
