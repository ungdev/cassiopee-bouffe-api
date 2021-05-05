import { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Error, DecodedToken } from '../types';
import { notFound, unauthenticated } from '../utils/responses';
import { fetchVendor } from '../operations/vendor';
import env from '../utils/env';
import logger from '../utils/logger';

// Fetch vendor from database if possible
export const initVendorRequest = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  // Get authorization header
  const authorizationHeader = request.get('Authorization');
  if (!authorizationHeader) {
    return next();
  }

  // Get the JsonWebToken from the authorization header
  // Authorization header is of the form "Bearer {token}"
  const token = authorizationHeader.split(' ')[1];

  try {
    // Decode the jwt
    const decodedToken = jwt.verify(token, env.jwt.secret) as DecodedToken;

    // Fetch the vendor from the database
    const vendor = await fetchVendor(decodedToken.vendorId);

    if (!vendor) {
      return unauthenticated(response);
    }

    // Set the sentry vendor to identify the problem in case of 500
    Sentry.setUser({ id: vendor.id, username: vendor.name });

    // Store it in `response.locals.vendor` so that we can use it later
    response.locals.vendor = vendor;
  } catch (error) {
    logger.error(error);

    // Token has expired
    if (error instanceof TokenExpiredError) {
      return unauthenticated(response, Error.ExpiredToken);
    }

    return unauthenticated(response, Error.InvalidToken);
  }

  return next();
};
