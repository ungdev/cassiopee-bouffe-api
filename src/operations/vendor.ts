import { Vendor } from '@prisma/client';
import database from '../services/database';

export const fetchVendor = async (parameterId: string, key = 'id'): Promise<Vendor> => {
  const vendor = await database.vendor.findUnique({
    where: { [key]: parameterId },
  });

  return vendor;
};
