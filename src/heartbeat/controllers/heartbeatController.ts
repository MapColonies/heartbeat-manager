import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@map-colonies/telemetry';
import { BoundCounter } from '@opentelemetry/api-metrics';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { Services } from '../../common/constants';
import { HeartbeatManager, IGetExpiredHeartbeatsRequest, IPulseRequest } from '../models/heartbeatManager';

type PulseHandler = RequestHandler<IPulseRequest>;
type GetExpiredHeartbeatsHandler = RequestHandler<IGetExpiredHeartbeatsRequest, string[]>;

@injectable()
export class HeartbeatController {
  private readonly createdResourceCounter: BoundCounter;

  public constructor(
    @inject(Services.LOGGER) private readonly logger: Logger,
    @inject(HeartbeatManager) private readonly manager: HeartbeatManager,
    @inject(Services.METER) private readonly meter: Meter
  ) {
    this.createdResourceCounter = meter.createCounter('created_resource');
  }

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
}
