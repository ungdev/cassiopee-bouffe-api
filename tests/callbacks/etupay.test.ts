import crypto from 'crypto';
import request from 'supertest';
import app from '../../src/app';
import { sandbox } from '../setup';
import * as orderOperations from '../../src/operations/order';
import database from '../../src/services/database';
import { Error } from '../../src/types';
import { createFakeItem, createFakeOrder, createFakeVendor } from '../utils';
import env from '../../src/utils/env';
import { encodeToBase64, randomInt } from '../../src/utils/helpers';
import { Order } from '.prisma/client';
import nanoid from '../../src/utils/nanoid';

const createEtupayPayload = (etupayBody: object) => {
  // Strinigifies the etupay body
  const stringifiedEtupayBody = JSON.stringify(etupayBody);

  // Serializes the etupay body
  const serializedEtupayBody = `s:${stringifiedEtupayBody.length}:"${stringifiedEtupayBody}";`;

  // Use the same key as it will be used by the etupay middleware
  const key = Buffer.from(env.etupay.key, 'base64');

  // Create a random initial vector
  const initialVector = crypto.randomBytes(16);

  // Create a cipher to encrypt the body
  const cipher = crypto.createCipheriv('aes-256-cbc', key, initialVector);

  // Encrypts the etupay body
  const encryptedEtupayBody = Buffer.concat([cipher.update(serializedEtupayBody, 'utf-8'), cipher.final()]);

  // Create an HMAC based on the initial vector and the encrypted value
  const mac = crypto
    .createHmac('sha256', key)
    .update(initialVector.toString('base64') + encryptedEtupayBody.toString('base64'))
    .digest('hex');

  // Create the payload with the value encrypted in base64
  return encodeToBase64({
    iv: initialVector.toString('base64'),
    value: encryptedEtupayBody.toString('base64'),
    mac,
  });
};

describe('POST /callbacks/etupay', () => {
  it('should return a valid answer', () => request(app).post('/callbacks/etupay').expect(200, { api: 'ok' }));
});

describe.only('GET /callbacks/etupay', () => {
  let order: Order;
  let paidPayload: string;
  let refusedPayload: string;

  before(async () => {
    const vendor = await createFakeVendor();
    const item = await createFakeItem({ vendor });
    order = await createFakeOrder({ vendor, orderItems: [{ id: nanoid(), itemId: item.id, quantity: 1 }] });

    // This is the data format how it is encrypted in the payload
    const etupayBody = {
      // Create a random transaction id
      transaction_id: randomInt(10000, 99999),
      type: 'checkout',
      // We bought a ticket for a player, so 15€ (the price doesn't matter now),
      amount: 1500,
      step: 'PAID',
      // Create the service data as it is in the createOrder controller. (It is already encoded in the data)
      service_data: encodeToBase64({ orderId: order.id }),
    };

    // Create a paid payload
    paidPayload = createEtupayPayload(etupayBody);

    // Create a refused payload
    const failedOrder = await createFakeOrder({ vendor, orderItems: [{ id: nanoid(), itemId: item.id, quantity: 1 }] });
    etupayBody.step = 'REFUSED';
    etupayBody.service_data = encodeToBase64({ orderId: failedOrder.id });
    refusedPayload = createEtupayPayload(etupayBody);
  });

  after(async () => {
    await database.orderItem.deleteMany();
    await database.order.deleteMany();
    await database.item.deleteMany();
    await database.vendor.deleteMany();
  });

  it('should fail because the payload is missing', () =>
    request(app).get('/callbacks/etupay').expect(400, { error: Error.InvalidQueryParameters }));

  it('should fail because the payload is invalid', () =>
    request(app).get('/callbacks/etupay?payload=invalidPayload').expect(400, { error: Error.InvalidQueryParameters }));

  it("should fail because the order wasn't found", async () => {
    // Update the order id to make it not found
    const savedOrder = order;

    await database.order.update({
      data: { id: 'A1B2C3' },
      where: { id: order.id },
    });

    await request(app).get(`/callbacks/etupay?payload=${paidPayload}`).expect(404, { error: Error.OrderNotFound });

    // Reupdate the order to make it having the previous id
    await database.order.update({
      data: { id: savedOrder.id },
      where: { id: 'A1B2C3' },
    });
  });

  it('should return an internal server error', async () => {
    sandbox.stub(orderOperations, 'fetchOrder').throws('Unexpected error');
    await request(app)
      .get(`/callbacks/etupay?payload=${paidPayload}`)
      .expect(500, { error: Error.InternalServerError });
  });

  it('should redirect to the error URL as the payment was rejected', () =>
    request(app)
      .get(`/callbacks/etupay?payload=${refusedPayload}`)
      .expect(302)
      .expect('Location', env.etupay.errorUrl));

  it('should reject as the payment is already errored', () =>
    request(app).get(`/callbacks/etupay?payload=${refusedPayload}`).expect(403, { error: Error.AlreadyErrored }));

  it('should successfully redirect to the success url', () =>
    request(app).get(`/callbacks/etupay?payload=${paidPayload}`).expect(302).expect('Location', env.etupay.successUrl));

  it('should fail as the order is already paid', () =>
    request(app).get(`/callbacks/etupay?payload=${paidPayload}`).expect(403, { error: Error.AlreadyPaid }));
});
