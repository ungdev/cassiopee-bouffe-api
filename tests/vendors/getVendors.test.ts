import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app';
import { sandbox } from '../setup';
import * as vendorOperations from '../../src/operations/vendor';
import { Error } from '../../src/types';
import { createFakeItem, createFakeVendor } from '../utils';
import database from '../../src/services/database';

describe.only('GET /vendors', () => {
  before(async () => {
    const vendor = await createFakeVendor({ name: 'lol' });
    await createFakeItem({ vendor });
  });

  after(async () => {
    await database.item.deleteMany();
    await database.vendor.deleteMany();
  });

  it('should fail with an internal server error', async () => {
    sandbox.stub(vendorOperations, 'fetchVendors').throws('Unexpected error');

    await request(app).get('/vendors').expect(500, { error: Error.InternalServerError });
  });

  it('should return 200 with an array of vendors', async () => {
    const response = await request(app).get('/vendors').expect(200);

    expect(response.body).to.have.lengthOf(1);

    const vendors = await vendorOperations.fetchVendors();

    const testingResult = {
      id: vendors[0].id,
      name: 'lol',
      items: [
        {
          id: vendors[0].items[0].id,
          name: vendors[0].items[0].name,
          available: vendors[0].items[0].available,
          price: vendors[0].items[0].price,
        },
      ],
    };

    expect(testingResult).to.deep.include(response.body[0]);
  });
});
