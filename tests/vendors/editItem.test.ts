import { Item } from '@prisma/client';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app';
import { sandbox } from '../setup';
import * as itemOperations from '../../src/operations/item';
import { Error, Vendor } from '../../src/types';
import { createFakeItem, createFakeVendor } from '../utils';
import database from '../../src/services/database';
import { fetchVendor } from '../../src/operations/vendor';
import { generateToken } from '../../src/utils/vendor';

describe.only('PATCH /vendors/me/items/:itemId', () => {
  let vendor: Vendor;
  let token: string;
  let item: Item;

  const validBody = { available: false };

  before(async () => {
    const createdVendor = await createFakeVendor({ name: 'lol' });
    vendor = await fetchVendor(createdVendor.id);
    token = generateToken(vendor);

    item = await createFakeItem({ vendor });
  });

  after(async () => {
    await database.item.deleteMany();
    await database.vendor.deleteMany();
  });

  it('should fail as the user is not authenticated', async () => {
    await request(app)
      .patch(`/vendors/me/items/${item.id}`)
      .send(validBody)
      .expect(401, { error: Error.Unauthenticated });
  });

  it('should fail as the body is invalid', async () => {
    await request(app)
      .patch(`/vendors/me/items/${item.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'lol' })
      .expect(400, { error: Error.InvalidBody });
  });

  it('should fail with an internal server error', async () => {
    sandbox.stub(itemOperations, 'editItem').throws('Unexpected error');

    await request(app)
      .patch(`/vendors/me/items/${item.id}`)
      .send(validBody)
      .set('Authorization', `Bearer ${token}`)
      .expect(500, { error: Error.InternalServerError });
  });

  it('should return 200 with the updated item', async () => {
    const response = await request(app)
      .patch(`/vendors/me/items/${item.id}`)
      .send(validBody)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const testingResult = {
      id: item.id,
      name: item.name,
      price: item.price,
      available: false,
    };

    expect(testingResult).to.deep.include(response.body);

    const updatedItem = await itemOperations.fetchItem(item.id);
    expect(updatedItem.available).to.be.equal(false);
  });
});
