import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app';
import { sandbox } from '../setup';
import * as orderOperations from '../../src/operations/order';
import { Error, Order, Vendor } from '../../src/types';
import { createFakeItem, createFakeOrder, createFakeVendor } from '../utils';
import database from '../../src/services/database';
import nanoid from '../../src/utils/nanoid';
import { fetchVendor } from '../../src/operations/vendor';
import { OrderStatus } from '.prisma/client';
import { generateToken } from '../../src/utils/vendor';

describe('PATCH /vendors/me/orders/:orderId', () => {
  let vendor: Vendor;
  let token: string;
  let order: Order;

  const validBody = { status: 'preparing' };

  before(async () => {
    const createdVendor = await createFakeVendor({ name: 'lol' });
    vendor = await fetchVendor(createdVendor.id);
    token = generateToken(vendor);

    const item = await createFakeItem({ vendor });

    // Create a fake order and put it to pending
    order = await createFakeOrder({
      vendor,
      orderItems: [{ itemId: item.id, quantity: 1, id: nanoid() }],
    });
    await database.order.update({ data: { status: OrderStatus.pending }, where: { id: order.id } });
  });

  after(async () => {
    await database.orderItem.deleteMany();
    await database.order.deleteMany();
    await database.item.deleteMany();
    await database.vendor.deleteMany();
  });

  it('should fail as the user is not authenticated', async () => {
    await request(app)
      .patch(`/vendors/me/orders/${order.id}`)
      .send(validBody)
      .expect(401, { error: Error.Unauthenticated });
  });

  it('should fail as the body is invalid', async () => {
    await request(app)
      .patch(`/vendors/me/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'lol' })
      .expect(400, { error: Error.InvalidBody });
  });

  it('should fail because the order id is invalid', async () => {
    await request(app)
      .patch(`/vendors/me/orders/lol`)
      .send(validBody)
      .set('Authorization', `Bearer ${token}`)
      .expect(404, { error: Error.OrderNotFound });
  });

  for (const invalidStatus of [OrderStatus.ready, OrderStatus.finished]) {
    it(`should fail because the status is not allowed [${invalidStatus}]`, async () => {
      await request(app)
        .patch(`/vendors/me/orders/${order.id}`)
        .send({ status: invalidStatus })
        .set('Authorization', `Bearer ${token}`)
        .expect(403, { error: Error.InvalidOrderStatus });
    });
  }

  it('should fail with an internal server error', async () => {
    sandbox.stub(orderOperations, 'editOrder').throws('Unexpected error');

    await request(app)
      .patch(`/vendors/me/orders/${order.id}`)
      .send(validBody)
      .set('Authorization', `Bearer ${token}`)
      .expect(500, { error: Error.InternalServerError });
  });

  it('should return 200 with the updated order', async () => {
    const response = await request(app)
      .patch(`/vendors/me/orders/${order.id}`)
      .send(validBody)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const testingResult = {
      id: order.id,
      displayId: order.displayId,
      firstname: order.firstname,
      lastname: order.lastname,
      status: 'preparing',
      orderItems: [
        {
          id: order.orderItems[0].id,
          quantity: order.orderItems[0].quantity,
          item: {
            id: order.orderItems[0].item.id,
            name: order.orderItems[0].item.name,
            description: order.orderItems[0].item.description,
            price: order.orderItems[0].item.price,
            available: order.orderItems[0].item.available,
          },
        },
      ],
    };

    expect(testingResult).to.deep.include(response.body);

    const updatedOrder = await orderOperations.fetchOrder(order.id);
    expect(updatedOrder.status).to.be.equal('preparing');
  });
});
