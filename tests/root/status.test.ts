import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app';

describe('GET /', () => {
  it('should return succesfully', async () => {
    const { body } = await request(app).get('/').expect(200);

    expect(body.http).to.be.true;
  });
});
