import { Provider, Vendor } from '@prisma/client';
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

export const createOrder = (order: {
  firstname: string;
  lastname: string;
  provider: Provider;
  vendor: Vendor;
  orderItems: PrimitiveOrderItem[];
}) =>
  database.order.create({
    data: {
      id: nanoid(),
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
