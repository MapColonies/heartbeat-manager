import { HttpError } from '@map-colonies/error-express-handler';
import { Logger } from '@map-colonies/js-logger';
import { ErrorRequestHandler, NextFunction } from 'express';
import { container } from 'tsyringe';
import { SERVICES } from './constants';

export function getErrorLoggerMiddleware(): ErrorRequestHandler {
  const logger = container.resolve<Logger>(SERVICES.LOGGER);
  const errorLogger: ErrorRequestHandler = (err: HttpError, req, res, next: NextFunction): void => {
    logger.error(err.message);
    next(err);
  };
  return errorLogger;
}
