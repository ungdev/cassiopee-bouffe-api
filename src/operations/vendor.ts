import { Vendor } from '@prisma/client';
import database from '../services/database';

export const fetchVendor = async (parameterId: string, key = 'id') => {
  const vendor = await database.vendor.findUnique({
    where: { [key]: parameterId },
    include: { items: true },
  });

  return vendor;
};

export const fetchVendors = () => database.vendor.findMany();

export const createVendor = (vendor: Vendor) => {
  if (!/^\d{6}$/.test(vendor.pin)) {
    throw new Error('The pin must be composed of 6 digits');
  }

  return database.vendor.create({ data: vendor });
};
