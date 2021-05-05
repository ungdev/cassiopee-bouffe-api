import { pick } from 'lodash';
import { Order } from '.prisma/client';
import { Vendor } from '../types';

export const filterVendor = (vendor: Vendor) => pick(vendor, ['id', 'name', 'items']);

export const filterVendorRestricted = (vendor: Vendor) => {
  const restrictedVendor = pick(vendor, ['id', 'name']);

  const restrictedItems = vendor.items.map((item) => pick(item, ['id', 'name', 'price', 'available']));

  return {
    ...restrictedVendor,
    items: restrictedItems,
  };
};

export const filterOrderRestricted = (order: Order) => pick(order, ['id', 'firstname', 'status']);
