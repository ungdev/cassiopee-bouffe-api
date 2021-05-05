import { Item, Vendor } from '@prisma/client';
import request from 'supertest';
import faker from 'faker';
import { expect } from 'chai';
import app from '../../src/app';
import { sandbox } from '../setup';
import * as vendorOperations from '../../src/operations/vendor';
import database from '../../src/services/database';
import { Error } from '../../src/types';
import { createFakeItem, createFakeVendor } from '../utils';
import { PayBody } from '../../src/controllers/vendors/createOrder';
import env from '../../src/utils/env';
import { randomInt } from '../../src/utils/helpers';

describe('POST /vendors/:vendorId/orders', () => {
  let vendor: Vendor;

  const items: Item[] = [];

  let validBody: PayBody;

  before(async () => {
    vendor = await createFakeVendor();

    // Create random items
    for (let index = 0; index < 5; index += 1) {
      const item = await createFakeItem({ vendor });
      items.push(item);
    }

    validBody = {
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      provider: 'etupay',
      items: items.map((item) => ({ id: item.id, quantity: randomInt(1, 5) })),
    };
  });

  after(async () => {
    // Delete the vendor created
    await database.orderItem.deleteMany();
    await database.order.deleteMany();
    await database.item.deleteMany();
    await database.vendor.deleteMany();
  });

  it('should fail because the body is missing', async () => {
    await request(app)
      .post(`/vendors/${vendor.id}/orders`)
      .expect(400, { error: Error.InvalidBody });
  });

  describe('test fail quantity (negative, null and float)', () => {
    for (const quantity of [-1, 0, 0.25]) {
      it(`should fail as the quantity ${quantity}`, async () => {
        await request(app)
          .post(`/vendors/${vendor.id}/orders`)
          .send({
            ...validBody,
            items: [{ id: items[0].id, quantity }],
          })
          .expect(400, { error: Error.InvalidBody });
      });
    }
  });

  it('should fail because the basket is empty', async () => {
    await request(app)
      .post(`/vendors/${vendor.id}/orders`)
      .send({
        ...validBody,
        items: [],
      })
      .expect(400, { error: Error.EmptyBasket });
  });

  it('should fail because one of the item is invalid', async () => {
    await request(app)
      .post(`/vendors/${vendor.id}/orders`)
      .send({
        ...validBody,
        items: [...validBody.items, { id: 'lol', quantity: 1 }],
      })
      .expect(404, { error: Error.ItemNotFound });
  });

  it('should fail because the items are not unique', async () => {
    await request(app)
      .post(`/vendors/${vendor.id}/orders`)
      .send({
        ...validBody,
        items: [validBody.items[0], validBody.items[0]],
      })
      .expect(400, { error: Error.InvalidBody });
  });

  it('should fail as the vendor does not exists', async () => {
    await request(app)
      .post(`/vendors/lolilol/orders`)
      .send(validBody)
      .expect(404, { error: Error.VendorNotFound });
  });

  it('should fail as the supplement does not exists', async () => {
    await request(app)
      .post(`/vendors/${vendor.id}/orders`)
      .send({
        ...validBody,
        items: [{ id: 'lol', quantity: 1 }],
      })
      .expect(404, { error: Error.ItemNotFound });
  });

  it('should fail as the item is not available', async () => {
    const notAvailableItem = await createFakeItem({ vendor, available: false });

    await request(app)
      .post(`/vendors/${vendor.id}/orders`)
      .send({
        ...validBody,
        items: [...validBody.items, { id: notAvailableItem.id, quantity: 1 }],
      })
      .expect(403, { error: Error.ItemNotAvailable });
  });

  it('should fail with an internal server error', async () => {
    sandbox.stub(vendorOperations, 'fetchVendor').throws('Unexpected error');

    await request(app)
      .post(`/vendors/${vendor.id}/orders`)
      .send(validBody)
      .expect(500, { error: Error.InternalServerError });
  });

  it('should successfuly create an order', async () => {
    const { body } = await request(app)
      .post(`/vendors/${vendor.id}/orders`)
      .send(validBody)
      .expect(201);

    const orders = await database.order.findMany({
      include: { orderItems: { include: { item: true } } },
    });
    const [order] = orders;

    expect(body.url).to.startWith(env.etupay.url);

    // Calculate price
    const expectedPrice = order.orderItems.reduce(
      (previous, current) => previous + current.quantity * current.item.price,
      0,
    );

    expect(orders).to.have.lengthOf(1);
    expect(order.firstname).to.be.equal(validBody.firstname);
    expect(order.orderItems).to.have.lengthOf(validBody.items.length);
    expect(body.price).to.be.equal(expectedPrice);
  });
});
