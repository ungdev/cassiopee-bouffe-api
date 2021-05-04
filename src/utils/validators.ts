import Joi from 'joi';
import { Provider } from '.prisma/client';

const nameRegex = /^[\p{L} _'-]{3,100}/u;
const pinRegex = /^\d{6}$/;

// General
export const id = Joi.string()
  .regex(/^[\dA-Z]{6}$/)
  .required();

// Vendor
export const name = Joi.string().regex(nameRegex);
export const pin = Joi.string().regex(pinRegex);

export const provider = Joi.string().valid(...Object.keys(Provider));
