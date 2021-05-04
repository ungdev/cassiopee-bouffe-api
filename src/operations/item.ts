import { Item } from '@prisma/client';
import database from '../services/database';

export const fetchItems = async (): Promise<Item[]> => {
  // fetches the items
  const items = await database.item.findMany();

  return items;
};
