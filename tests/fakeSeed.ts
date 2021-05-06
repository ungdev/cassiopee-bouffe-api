import { sample } from 'lodash';
import logger from '../src/utils/logger';
import { randomInt } from '../src/utils/helpers';
import { createFakeItem, createFakeOrder, createFakeVendor } from './utils';
import nanoid from '../src/utils/nanoid';
import { Item } from '.prisma/client';
import { PrimitiveOrderItem } from '../src/types';
import database from '../src/services/database';

// Just a script to populate the DB with fake data
(async () => {
  for (let vendorIndex = 0; vendorIndex < 2; vendorIndex += 1) {
    const vendor = await createFakeVendor();
    logger.info(`Vendor ${vendor.name} (${vendor.id}) created`);

    const items: Item[] = [];

    for (let itemIndex = 0; itemIndex < 20; itemIndex += 1) {
      const item = await createFakeItem({ vendor });
      items.push(item);
      logger.info(`Item ${item.name} (${item.id}) created`);
    }

    for (let orderIndex = 0; orderIndex < 20; orderIndex += 1) {
      const orderItems: PrimitiveOrderItem[] = [];

      for (let orderItemIndex = 0; orderItemIndex < randomInt(1, 5); orderItemIndex += 1) {
        orderItems.push({ quantity: randomInt(1, 3), id: nanoid(), itemId: sample(items).id });
      }

      const order = await createFakeOrder({ vendor, orderItems });
      logger.info(`Order #${order.displayId} (${order.id}) created`);
    }
  }

  await database.$disconnect();
})().catch((error) => {
  logger.error(error);
  process.exit(1);
});
