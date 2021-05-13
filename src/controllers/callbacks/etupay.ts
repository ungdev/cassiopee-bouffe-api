import { OrderStatus, TransactionState } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { fetchOrder, editOrder } from '../../operations/order';
import * as etupay from '../../services/etupay';
import { Error, EtupayError, EtupayResponse } from '../../types';
import { decodeFromBase64 } from '../../utils/helpers';
import { badRequest, forbidden, notFound, success } from '../../utils/responses';

// Called by the client
export const clientCallback = [
  // Use the middleware to decrypt the data
  etupay.middleware,

  // Create a small middleware to be able to handle payload errors.
  // The eslint disabling is important because the error argument can only be gotten in the 4 arguments function
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error: EtupayError, request: Request, response: Response, next: NextFunction) =>
    badRequest(response, Error.InvalidQueryParameters),

  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Retreive the base64 payload
      const etupayResponse = response.locals.etupay as EtupayResponse;

      // Decode the base64 string to an object
      const decoded = decodeFromBase64(etupayResponse.serviceData);
      const { orderId } = decoded;

      // Fetch the order from the orderId
      const order = await fetchOrder(orderId);

      // If the order wasn't found, return a 404
      if (!order) {
        return notFound(response, Error.OrderNotFound);
      }

      // If the transaction is already paid
      if (order.transactionState === TransactionState.paid) {
        return forbidden(response, Error.AlreadyPaid);
      }

      // If the transaction is already errored
      if (order.transactionState !== TransactionState.pending) {
        return forbidden(response, Error.AlreadyErrored);
      }

      // If the transaction state wasn't paid, redirect to the error url
      if (!etupayResponse.paid) {
        // Update the order with the callback data
        await editOrder(order.id, {
          transactionState: etupayResponse.step,
          transactionId: etupayResponse.transactionId,
          status: OrderStatus.cancelled,
        });

        return response.render('paymentCallback', {
          order: { displayId: order.displayId, successful: false },
        });
      }

      await editOrder(order.id, {
        transactionState: etupayResponse.step,
        transactionId: etupayResponse.transactionId,
        status: OrderStatus.pending,
      });

      return response.render('paymentCallback', {
        order: { displayId: order.displayId, successful: true },
      });
    } catch (error) {
      return next(error);
    }
  },
];

// Called by the bank few minutes after
export const bankCallback = (request: Request, response: Response) =>
  success(response, { api: 'ok' });
