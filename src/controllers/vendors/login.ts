import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { isNotAuthenticated } from '../../middlewares/authentication';
import { validateBody } from '../../middlewares/validation';
import * as validators from '../../utils/validators';
import { fetchVendor } from '../../operations/vendor';
import { success, unauthenticated } from '../../utils/responses';
import { Error } from '../../types';
import { generateToken } from '../../utils/vendor';
import { filterVendor } from '../../utils/filters';

export default [
  // Middlewares
  isNotAuthenticated,
  validateBody(
    Joi.object({
      pin: validators.pin.required(),
    }),
  ),

  // Controller
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { pin } = request.body;

      // Fetch the vendor
      const vendor = await fetchVendor(pin, 'pin');

      // Checks if the vendor exists
      if (!vendor) {
        return unauthenticated(response, Error.InvalidCredentials);
      }

      const token = generateToken(vendor);

      return success(response, {
        vendor: filterVendor(vendor),
        token,
      });
    } catch (error) {
      return next(error);
    }
  },
];
