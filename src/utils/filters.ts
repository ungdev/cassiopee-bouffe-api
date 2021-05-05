import { pick } from 'lodash';
import { Vendor, Order } from '../types';

export const filterVendor = (vendor: Vendor) => pick(vendor, ['id', 'name', 'items']);

export const filterVendorRestricted = (vendor: Vendor) => {
  const restrictedVendor = pick(vendor, ['id', 'name']);

  const restrictedItems = vendor.items.map((item) =>
    pick(item, ['id', 'name', 'price', 'available']),
  );

  return {
    ...restrictedVendor,
    items: restrictedItems,
  };
};

export const filterOrder = (order: Order) => {
  const restrictedOrder = pick(order, ['id', 'firstname', 'lastname', 'status']);

  const restrictedOrderItems = order.orderItems.map((orderItem) => {
    const restrictedOrderItem = pick(orderItem, 'id', 'quantity');
    const restrictedItem = pick(orderItem.item, ['id', 'name', 'price', 'available']);

    return {
      ...restrictedOrderItem,
      item: restrictedItem,
    };
  });

  return {
    ...restrictedOrder,
    orderItems: restrictedOrderItems,
  };
};

export const filterOrderRestricted = (order: Order) => pick(order, ['id', 'firstname', 'status']);
