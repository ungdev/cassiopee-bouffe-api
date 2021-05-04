import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Basket } from '../../services/etupay';
import { validateBody } from '../../middlewares/validation';
import { encodeToBase64, removeAccents } from '../../utils/helpers';
import { created, notFound, forbidden, badRequest } from '../../utils/responses';
import * as validators from '../../utils/validators';
import { fetchVendor } from '../../operations/vendor';
import { Error, PrimitiveOrderItem } from '../../types';
import { createOrder } from '../../operations/order';
import { Provider } from '.prisma/client';
import nanoid from '../../utils/nanoid';

export interface PayBody {
  firstname: string;
  lastname: string;
  provider: Provider;
  items: { id: string; quantity: number }[];
}

export default [
  // Middlewares

  validateBody(
    Joi.object({
      firstname: validators.name.required(),
      lastname: validators.name.required(),
      provider: validators.provider.required(),
      items: Joi.array()
        .items(
          Joi.object({
            id: Joi.string().required(),
            quantity: Joi.number().min(1).required(),
          }),
        )
        .unique((a, b) => a.id === b.id)
        .required(),
    }),
  ),

  // Controller
  async (request: Request<{ vendorId: string }, {}, PayBody>, response: Response, next: NextFunction) => {
    try {
      const { body, params } = request;

      // Retreive the find vendor
      const vendor = await fetchVendor(params.vendorId);

      // Checks if the vendor provided in the body exists
      if (!vendor) {
        return notFound(response, Error.VendorNotFound);
      }

      // If some of the item does not belong to the vendor
      if (body.items.some((bodyItem) => !vendor.items.some((vendorItem) => bodyItem.id === vendorItem.id))) {
        return notFound(response, Error.ItemNotFound);
      }

      // Form the order items object
      const orderItems: PrimitiveOrderItem[] = [];

      // Check items loop and add the order items
      for (const bodyItem of body.items) {
        const item = vendor.items.find((findItem) => findItem.id === bodyItem.id);

        if (!item) {
          return notFound(response, Error.ItemNotFound);
        }

        if (!item.available) {
          return forbidden(response, Error.ItemNotAvailable);
        }

        orderItems.push({ id: nanoid(), itemId: bodyItem.id, quantity: bodyItem.quantity });
      }

      if (orderItems.length === 0) {
        return badRequest(response, Error.EmptyBasket);
      }

      const order = await createOrder({
        firstname: body.firstname,
        lastname: body.lastname,
        provider: body.provider,
        vendor,
        orderItems,
      });

      // Creates a etupay basket. The accents need to be removed as on the website they don't appear otherwise
      // We also send as encoded data the cartId to be able to retreive it in the callback
      const basket = new Basket(
        'Cassiopee',
        removeAccents(body.firstname),
        removeAccents(body.lastname),
        '',
        'checkout',
        encodeToBase64({ orderId: order.id }),
      );

      // Foreach cartitem
      for (const orderItem of order.orderItems) {
        // Add the item to the etupay basket
        basket.addItem(removeAccents(orderItem.item.name), orderItem.item.price, orderItem.quantity);
      }

      // Returns a answer with the etupay url
      return created(response, { url: basket.compute(), price: basket.getPrice() });
    } catch (error) {
      return next(error);
    }
  },
];
