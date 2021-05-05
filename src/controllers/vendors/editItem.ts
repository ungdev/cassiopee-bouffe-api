import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { validateBody } from '../../middlewares/validation';
import { notFound, success } from '../../utils/responses';
import { Error } from '../../types';
import { getRequestInfo } from '../../utils/vendor';
import { filterItem } from '../../utils/filters';
import { isAuthenticated } from '../../middlewares/authentication';
import { editItem, fetchItem } from '../../operations/item';

export interface Body {
  available: boolean;
}

export default [
  // Middlewares
  isAuthenticated,

  validateBody(
    Joi.object({
      available: Joi.boolean().required(),
    }),
  ),

  // Controller
  async (
    request: Request<{ itemId: string }, {}, Body>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { body, params } = request;

      // Retreive the find vendor
      const { vendor } = getRequestInfo(response);

      // If the item doesn't exists or doesn't belong to the vendor, return an error
      const item = vendor.items.find((findItem) => findItem.id === params.itemId);
      if (!item) {
        return notFound(response, Error.ItemNotFound);
      }

      await editItem(item.id, { available: body.available });

      const updatedItem = await fetchItem(item.id);

      return success(response, filterItem(updatedItem));
    } catch (error) {
      return next(error);
    }
  },
];
