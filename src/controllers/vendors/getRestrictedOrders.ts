import { NextFunction, Request, Response } from 'express';
import { fetchVendors } from '../../operations/vendor';
import { notFound, success } from '../../utils/responses';
import { filterOrderRestricted } from '../../utils/filters';
import { fetchOrders } from '../../operations/order';
import { Error } from '../../types';

export default [
  // Controller
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { vendorId } = request.params;

      const vendors = await fetchVendors();

      // If the vendor id doesn't exists
      if (!vendors.some((vendor) => vendor.id === vendorId)) {
        return notFound(response, Error.VendorNotFound);
      }

      const orders = await fetchOrders(vendorId);

      return success(response, orders.map(filterOrderRestricted));
    } catch (error) {
      return next(error);
    }
  },
];
