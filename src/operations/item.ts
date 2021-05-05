import { Item, Prisma, Vendor } from '@prisma/client';
import database from '../services/database';
import nanoid from '../utils/nanoid';

export const fetchItem = async (parameterId: string, key = 'id') => {
  const item = await database.item.findUnique({
    where: { [key]: parameterId },
  });

  return item;
};

export const fetchItems = async (): Promise<Item[]> => {
  // fetches the items
  const items = await database.item.findMany();

  return items;
};

export const createItem = (name: string, price: number, vendor: Vendor) =>
  database.item.create({
    data: {
      id: nanoid(),
      name,
      price,
      vendor: { connect: { id: vendor.id } },
    },
  });

export const setItemAvailibility = (itemId: string, available = true) =>
  database.item.update({ data: { available }, where: { id: itemId } });

export const editItem = (itemId: string, item: Prisma.ItemUpdateInput) =>
  database.item.update({
    data: item,
    where: {
      id: itemId,
    },
  });
