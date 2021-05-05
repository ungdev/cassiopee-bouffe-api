import { Item } from '@prisma/client';
import faker from 'faker';
import { Provider, Vendor } from '.prisma/client';
import { createItem, setItemAvailibility } from '../src/operations/item';
import { createOrder } from '../src/operations/order';
import { createVendor } from '../src/operations/vendor';
import { PrimitiveOrderItem } from '../src/types';
import nanoid from '../src/utils/nanoid';

export const generateFakePin = (length = 6) => {
  // Create an array of random numbers from 0 to 9
  const digits = Array.from({ length }, () => Math.floor(Math.random() * 10));

  // Reduce this array to a string
  return digits.reduce((previous, current) => previous + current.toString(), '');
};

export const createFakeVendor = ({
  name = faker.company.companyName(),
  pin,
}: { name?: string; pin?: string } = {}) => {
  const id = nanoid();

  return createVendor({
    id,
    name,
    pin: pin || generateFakePin(),
  });
};

export const createFakeItem = async ({
  name = faker.commerce.productName(),
  price = faker.datatype.number({ min: 100, max: 1000 }),
  available = true,
  vendor,
}: {
  name?: string;
  price?: number;
  available?: boolean;
  vendor: Vendor;
}): Promise<Item> => {
  const item = await createItem(name, price, vendor);

  // Update the item avai
  if (!available) {
    await setItemAvailibility(item.id, false);
    item.available = false;
  }

  return item;
};

export const createFakeOrder = ({
  firstname = faker.name.firstName(),
  lastname = faker.name.lastName(),
  provider = 'etupay',
  vendor,
  orderItems,
}: {
  firstname?: string;
  lastname?: string;
  provider?: Provider;
  vendor: Vendor;
  orderItems: PrimitiveOrderItem[];
}) => createOrder({ firstname, lastname, provider, vendor, orderItems });
