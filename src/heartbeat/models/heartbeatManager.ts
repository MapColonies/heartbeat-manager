import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { Tracer } from '@opentelemetry/api';
import { withSpanAsyncV4 } from '@map-colonies/telemetry';
import { SERVICES } from '../../common/constants';
import { HeartbeatRepository, HEARTBEAT_REPOSITORY_SYMBOL } from '../../DAL/repositories/heartbeatRepository';

export interface IPulseRequest {
  id: string;
}

export interface IGetExpiredHeartbeatsRequest {
  duration: number;
}

export interface IGetHeartbeatRequest {
  id: string;
}

export interface IGetHeartbeatResponse {
  id: string;
  lastHeartbeat: Date;
}

export type RemoveHeartbeatsRequest = string[];

@injectable()
export class HeartbeatManager {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.TRACER) public readonly tracer: Tracer,
    @inject(HEARTBEAT_REPOSITORY_SYMBOL) private readonly heartbeatRepository: HeartbeatRepository
  ) {}

  @withSpanAsyncV4
  public async pulse(req: IPulseRequest): Promise<void> {
    this.logger.info(`received heartbeat pulse for ${req.id}`);
    await this.heartbeatRepository.pulse(req.id);
  }

  @withSpanAsyncV4
  public async getExpiredHeartbeats(req: IGetExpiredHeartbeatsRequest): Promise<string[]> {
    this.logger.debug(`retrieving task without heartbeat for at least ${req.duration} ms`);
    return this.heartbeatRepository.findExpired(req.duration);
  }

  @withSpanAsyncV4
  public async removeHeartbeats(req: RemoveHeartbeatsRequest): Promise<number> {
    this.logger.info(`removing heartbeats: ${req.join()}`);
    return this.heartbeatRepository.removeHeartbeats(req);
  }

  @withSpanAsyncV4
  public async GetHeartbeatById(req: IGetHeartbeatRequest): Promise<IGetHeartbeatResponse | null> {
    this.logger.info(`retrieving heartbeat for id: ${req.id}`);
    return this.heartbeatRepository.getHeartbeat(req.id);
  }
}
