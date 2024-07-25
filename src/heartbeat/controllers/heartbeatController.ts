import { Logger } from '@map-colonies/js-logger';
import { NotFoundError } from '@map-colonies/error-types';
import { BoundCounter } from '@opentelemetry/api-metrics';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import {
  HeartbeatManager,
  IGetExpiredHeartbeatsRequest,
  IGetHeartbeatResponse,
  IPulseRequest,
  RemoveHeartbeatsRequest,
} from '../models/heartbeatManager';

type PulseHandler = RequestHandler<IPulseRequest>;
type GetExpiredHeartbeatsHandler = RequestHandler<IGetExpiredHeartbeatsRequest, string[]>;
type RemoveHeartbeatHandler = RequestHandler<undefined, undefined, RemoveHeartbeatsRequest>;
type GetHeartbeatHandler = RequestHandler<IGetHeartbeatResponse>;

@injectable()
export class HeartbeatController {
  private readonly createdResourceCounter: BoundCounter;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(HeartbeatManager) private readonly manager: HeartbeatManager
  ) {}

  public getExpiredHeartbeats: GetExpiredHeartbeatsHandler = async (req, res, next) => {
    try {
      const expiredHeartbeats = await this.manager.getExpiredHeartbeats(req.params);
      return res.status(httpStatus.OK).json(expiredHeartbeats);
    } catch (err) {
      next(err);
    }
  };

  public pulse: PulseHandler = async (req, res, next) => {
    try {
      await this.manager.pulse(req.params);
      return res.sendStatus(httpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  public removeHeartbeats: RemoveHeartbeatHandler = async (req, res, next) => {
    try {
      await this.manager.removeHeartbeats(req.body);
      return res.sendStatus(httpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  public getHeartbeatByTaskId: GetHeartbeatHandler = async (req, res, next) => {
    try {
      const record = await this.manager.GetHeartbeatById(req.params);
      if (record === null) {
        throw new NotFoundError('No heartbeat found for task');
      }
      return res.status(httpStatus.OK).json(record);
    } catch (err) {
      next(err);
    }
  };
}
