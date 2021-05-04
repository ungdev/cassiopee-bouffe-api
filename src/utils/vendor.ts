import { Vendor } from '@prisma/client';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import env from './env';

export const getRequestInfo = (response: Response) => ({
  vendor: response.locals.vendor as Vendor,
});

export const generateToken = (vendor: Vendor) =>
  jwt.sign({ vendorId: vendor.id }, env.jwt.secret, {
    expiresIn: env.jwt.expires,
  });
