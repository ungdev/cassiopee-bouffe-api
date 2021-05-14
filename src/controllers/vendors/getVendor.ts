import { NextFunction, Request, Response } from 'express';
import { isAuthenticated } from '../../middlewares/authentication';
import { success } from '../../utils/responses';
import { getRequestInfo } from '../../utils/vendor';
import { filterVendor } from '../../utils/filters';

export default [
  // Middlewares
  isAuthenticated,

  // Controller
  (request: Request, response: Response, next: NextFunction) => {
    try {
      const { vendor } = getRequestInfo(response);

      return success(response, filterVendor(vendor));
    } catch (error) {
      return next(error);
    }
  },
];
