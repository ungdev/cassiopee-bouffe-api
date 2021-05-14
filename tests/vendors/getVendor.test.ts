import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { sandbox } from '../setup';
import * as responses from '../../src/utils/responses';
import database from '../../src/services/database';
import { Error } from '../../src/types';
import { createFakeItem, createFakeVendor } from '../utils';
import { fetchVendor, fetchVendors } from '../../src/operations/vendor';
import { generateToken } from '../../src/utils/vendor';

describe('GET /vendors/me', () => {
  let token: string;

  before(async () => {
    const createdVendor = await createFakeVendor({ name: 'lol' });
    const vendor = await fetchVendor(createdVendor.id);
    await createFakeItem({ vendor });
    token = generateToken(vendor);
  });

  after(async () => {
    await database.item.deleteMany();
    await database.vendor.deleteMany();
  });

  it('should fail as the user is not authenticated', async () => {
    await request(app).get('/vendors/me').expect(401, { error: Error.Unauthenticated });
  });

  it('should throw an unexpected error', async () => {
    sandbox.stub(responses, 'success').throws('Unexpected error');

    await request(app)
      .get(`/vendors/me`)
      .set('Authorization', `Bearer ${token}`)
      .expect(500, { error: Error.InternalServerError });
  });

  it('should return the user', async () => {
    const response = await request(app)
      .get(`/vendors/me`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const vendors = await fetchVendors();

    const testingResult = {
      id: vendors[0].id,
      name: 'lol',
      items: [
        {
          id: vendors[0].items[0].id,
          name: vendors[0].items[0].name,
          description: vendors[0].items[0].description,
          available: vendors[0].items[0].available,
          price: vendors[0].items[0].price,
        },
      ],
    };

    expect(testingResult).to.deep.include(response.body);
  });
});
