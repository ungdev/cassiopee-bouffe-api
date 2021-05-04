import { Response, NextFunction, Request } from 'express';
import { getRequestInfo } from '../utils/vendor';
import { forbidden, unauthenticated } from '../utils/responses';
import { Error } from '../types';

// Checks the vendor is authenticated. If not, it will return an error
export const isAuthenticated = (request: Request, response: Response, next: NextFunction) => {
  // Retreives the vendor
  const { vendor } = getRequestInfo(response);

  // The vendor must exists
  if (!vendor) {
    return unauthenticated(response);
  }

  return next();
};

export const isNotAuthenticated = (request: Request, response: Response, next: NextFunction) => {
  const { vendor } = getRequestInfo(response);

  // If there is a vendor in the locals
  if (!vendor) {
    return next();
  }

  return forbidden(response, Error.AlreadyAuthenticated);
};
