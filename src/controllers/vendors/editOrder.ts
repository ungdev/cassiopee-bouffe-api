import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { validateBody } from '../../middlewares/validation';
import { notFound, forbidden, success } from '../../utils/responses';
import { Error } from '../../types';
import { editOrder, fetchOrder } from '../../operations/order';
import { OrderStatus } from '.prisma/client';
import { getRequestInfo } from '../../utils/vendor';
import { filterOrder } from '../../utils/filters';
import { isAuthenticated } from '../../middlewares/authentication';

export interface Body {
  status: OrderStatus;
}

const allowedDirections = [
  // pending ↔ preparing
  [OrderStatus.pending, OrderStatus.preparing],
  [OrderStatus.preparing, OrderStatus.pending],

  // preparing ↔ ready
  [OrderStatus.preparing, OrderStatus.ready],
  [OrderStatus.ready, OrderStatus.preparing],

  // ready → finished
  [OrderStatus.ready, OrderStatus.finished],

  // [pending, preparing, ready] → cancelled
  [OrderStatus.pending, OrderStatus.cancelled],
  [OrderStatus.preparing, OrderStatus.cancelled],
  [OrderStatus.ready, OrderStatus.cancelled],
];

export default [
  // Middlewares
  isAuthenticated,

  validateBody(
    Joi.object({
      status: Joi.string()
        // All order status except paying
        .valid(
          OrderStatus.pending,
          OrderStatus.preparing,
          OrderStatus.ready,
          OrderStatus.cancelled,
          OrderStatus.finished,
        )
        .required(),
    }),
  ),

  // Controller
  async (
    request: Request<{ orderId: string }, {}, Body>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { body, params } = request;

      // Retreive the find vendor
      const { vendor } = getRequestInfo(response);

      // Retreive the order
      const order = await fetchOrder(params.orderId);

      // If the order doesn't exists or is forbidden, return an error
      if (!order || order.vendorId !== vendor.id) {
        return notFound(response, Error.OrderNotFound);
      }

      // Check if the vendor is allowed edit according to the from and to state
      const allowed = allowedDirections.some(
        ([from, to]) => from === order.status && to === body.status,
      );

      if (!allowed) {
        return forbidden(response, Error.InvalidOrderStatus);
      }

      await editOrder(order.id, { status: body.status });

      const updatedOrder = await fetchOrder(order.id);

      return success(response, filterOrder(updatedOrder));
    } catch (error) {
      return next(error);
    }
  },
];
