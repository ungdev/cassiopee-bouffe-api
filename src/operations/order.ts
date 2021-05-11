import { Provider, Vendor, Prisma } from '@prisma/client';
import database from '../services/database';
import { PrimitiveOrderItem } from '../types';
import nanoid from '../utils/nanoid';

export const fetchOrder = async (parameterId: string, key = 'id') => {
  const order = await database.order.findUnique({
    where: { [key]: parameterId },
    include: { orderItems: { include: { item: true } } },
  });

  return order;
};

export const fetchOrders = (vendorId: string) =>
  database.order.findMany({
    where: {
      vendorId,
    },
    include: {
      orderItems: {
        include: {
          item: true,
        },
      },
    },
  });

// Create a display id that increments until 100 before reseting
// 2 reasons why we do this instead of fetching the last record of the DB and increment it
// 1 - The API calls can be concurrent so two orders could have the same id at the same time
// 2 - Fetching to the DB costs a call
let displayId = 0;

export const createOrder = (order: {
  firstname: string;
  lastname: string;
  provider: Provider;
  vendor: Vendor;
  orderItems: PrimitiveOrderItem[];
}) => {
  displayId = (displayId + 1) % 100;
  return database.order.create({
    data: {
      id: nanoid(),
      displayId,
      firstname: order.firstname,
      lastname: order.lastname,
      provider: order.provider,
      vendor: { connect: { id: order.vendor.id } },
      orderItems: { createMany: { data: order.orderItems } },
    },
    include: {
      orderItems: {
        include: {
          item: true,
        },
      },
    },
  });
};

export const editOrder = (orderId: string, order: Prisma.OrderUpdateInput) =>
  database.order.update({
    data: order,
    where: {
      id: orderId,
    },
  });
