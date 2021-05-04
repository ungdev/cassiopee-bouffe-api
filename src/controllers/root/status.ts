import { Request, Response } from 'express';
import { success } from '../../utils/responses';

export default [
  (request: Request, response: Response) => {
    success(response, {
      http: true,
    });
  },
];
