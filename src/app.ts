import express, { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import helmet from 'helmet';

import { notFound } from './utils/responses';
import { Error } from './types';
import router from './controllers';
import json from './middlewares/json';
import { morgan } from './utils/logger';
import { initVendorRequest } from './middlewares/vendor';
import env from './utils/env';
import errorHandler from './middlewares/errorHandler';

const app = express();

// Initiate Sentry
Sentry.init({ dsn: env.log.sentryDsn, environment: env.environment });
app.use(Sentry.Handlers.requestHandler({}));

app.use(morgan());

// Security middlewares
app.use(cors(), helmet());

// Use json middleware to check and parse json body
app.use(json);

// Fetch vendor from database
app.use(initVendorRequest);
// Main routes
app.use(env.api.prefix, router);

// Not found
app.use((request: Request, response: Response) => notFound(response, Error.RouteNotFound));

// Error Handles
app.use(errorHandler);

export default app;
