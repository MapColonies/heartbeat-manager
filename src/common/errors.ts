import { HttpError } from '@map-colonies/error-express-handler';
import { StatusCodes } from 'http-status-codes';

export class DBConnectionError extends Error implements HttpError {
  public status = StatusCodes.INTERNAL_SERVER_ERROR;
  public constructor() {
    super('Internal Server Error');
    Object.setPrototypeOf(this, DBConnectionError.prototype);
  }
}
