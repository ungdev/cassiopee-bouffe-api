import { NextFunction, Request, Response } from 'express';
import { fetchVendors } from '../../operations/vendor';
import { success } from '../../utils/responses';
import { filterVendor } from '../../utils/filters';

export default [
  // Controller
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const vendors = await fetchVendors();

      return success(response, vendors.map(filterVendor));
    } catch (error) {
      return next(error);
    }
  },
];
