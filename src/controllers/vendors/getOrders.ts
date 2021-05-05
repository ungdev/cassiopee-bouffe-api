import { NextFunction, Request, Response } from 'express';
import { success } from '../../utils/responses';
import { filterOrder } from '../../utils/filters';
import { fetchOrders } from '../../operations/order';
import { getRequestInfo } from '../../utils/vendor';
import { isAuthenticated } from '../../middlewares/authentication';

export default [
  // Middlewares
  isAuthenticated,
  // Controller
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { vendor } = getRequestInfo(response);

      const orders = await fetchOrders(vendor.id);

      return success(response, orders.map(filterOrder));
    } catch (error) {
      return next(error);
    }
  },
];
