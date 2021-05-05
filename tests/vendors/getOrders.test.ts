import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app';
import { sandbox } from '../setup';
import * as orderOperations from '../../src/operations/order';
import { Error, Vendor } from '../../src/types';
import { createFakeItem, createFakeOrder, createFakeVendor } from '../utils';
import database from '../../src/services/database';
import nanoid from '../../src/utils/nanoid';
import { fetchVendor } from '../../src/operations/vendor';
import { OrderStatus } from '.prisma/client';
import { generateToken } from '../../src/utils/vendor';

describe('GET /vendors/:vendorId/orders', () => {
  let vendor: Vendor;
  let token: string;

  before(async () => {
    const createdVendor = await createFakeVendor({ name: 'lol' });
    vendor = await fetchVendor(createdVendor.id);
    token = generateToken(vendor);

    const item = await createFakeItem({ vendor });
    await createFakeOrder({ vendor, orderItems: [{ itemId: item.id, quantity: 1, id: nanoid() }] });
  });

  after(async () => {
    await database.orderItem.deleteMany();
    await database.order.deleteMany();
    await database.item.deleteMany();
    await database.vendor.deleteMany();
  });

  it('should fail as the user is not authenticated', async () => {
    await request(app).get(`/vendors/me/orders`).expect(401, { error: Error.Unauthenticated });
  });

  it('should fail with an internal server error', async () => {
    sandbox.stub(orderOperations, 'fetchOrders').throws('Unexpected error');

    await request(app)
      .get('/vendors/me/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(500, { error: Error.InternalServerError });
  });

  it('should return 200 with an array of vendors', async () => {
    const [order] = await orderOperations.fetchOrders(vendor.id);
    await database.order.update({ data: { status: OrderStatus.pending }, where: { id: order.id } });
    const response = await request(app)
      .get('/vendors/me/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).to.have.lengthOf(1);

    const testingResult = {
      id: order.id,
      firstname: order.firstname,
      lastname: order.lastname,
      status: 'pending',
      orderItems: [
        {
          id: order.orderItems[0].id,
          quantity: order.orderItems[0].quantity,
          item: {
            id: order.orderItems[0].item.id,
            name: order.orderItems[0].item.name,
            price: order.orderItems[0].item.price,
            available: order.orderItems[0].item.available,
          },
        },
      ],
    };

    expect(testingResult).to.deep.include(response.body[0]);
  });
});
