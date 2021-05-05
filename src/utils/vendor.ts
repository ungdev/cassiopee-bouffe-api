import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Vendor } from '../types';
import env from './env';

export const getRequestInfo = (response: Response) => ({
  vendor: response.locals.vendor as Vendor,
});

export const setRequestInfo = (response: Response, vendor: Vendor) => {
  response.locals.vendor = vendor;
};

export const generateToken = (vendor: Vendor) =>
  jwt.sign({ vendorId: vendor.id }, env.jwt.secret, {
    expiresIn: env.jwt.expires,
  });
