// Setup all environment variables
/* eslint-disable import/first*/
process.env.NODE_ENV = 'test';

import chai, { expect } from 'chai';
import chaiString from 'chai-string';
import sinon from 'sinon';
import database from '../src/services/database';

export const sandbox = sinon.createSandbox();

before(() => {
  chai.use(chaiString);
});

afterEach('Restore the sandbox after every tests', () => {
  sandbox.restore();
});

after(async () => {
  // Check that there is all tests where cleaning all their data. It is to prevent data concurrency
  // We check only tables that have dynamic data. (not seeded staticly)
  const vendorCount = await database.vendor.count();
  expect(vendorCount).to.be.equal(0);

  const orderCount = await database.order.count();
  expect(orderCount).to.be.equal(0);

  const itemCount = await database.item.count();
  expect(itemCount).to.be.equal(0);

  await database.$disconnect();
});
