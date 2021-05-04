import Joi from 'joi';

const nameRegex = /^[\p{L} _'-]{3,100}/u;
const pinRegex = /^\d{6}$/;

// General
export const id = Joi.string()
  .regex(/^[\dA-Z]{6}$/)
  .required();

// Vendor
export const name = Joi.string().regex(nameRegex);
export const pin = Joi.string().regex(pinRegex);
