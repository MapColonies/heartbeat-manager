import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { Tracer } from '@opentelemetry/api';
import { withSpanAsyncV4 } from '@map-colonies/telemetry';
import { SERVICES } from '../../common/constants';
import { ConnectionManager } from '../../DAL/connectionManager';
import { HeartbeatRepository } from '../../DAL/repositories/heartbeatRepository';

export interface IPulseRequest {
  id: string;
}

export interface IGetExpiredHeartbeatsRequest {
  duration: number;
}

export type RemoveHeartbeatsRequest = string[];

@injectable()
export class HeartbeatManager {
  private repository?: HeartbeatRepository;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.TRACER) public readonly tracer: Tracer,
    private readonly connectionManager: ConnectionManager
  ) {}

  @withSpanAsyncV4
  public async pulse(req: IPulseRequest): Promise<void> {
    this.logger.debug(`received heartbeat pulse for ${req.id}`);
    const repo = await this.getRepository();
    await repo.pulse(req.id);
  }

  @withSpanAsyncV4
  public async getExpiredHeartbeats(req: IGetExpiredHeartbeatsRequest): Promise<string[]> {
    this.logger.debug(`retrieving task without heartbeat for at least ${req.duration} ms`);
    const repo = await this.getRepository();
    return repo.findExpired(req.duration);
  }

  @withSpanAsyncV4
  public async removeHeartbeats(req: RemoveHeartbeatsRequest): Promise<void> {
    this.logger.debug(`removing heartbeats: ${req.join()}`);
    const repo = await this.getRepository();
    await repo.removeHeartbeats(req);
  }

  private async getRepository(): Promise<HeartbeatRepository> {
    if (!this.repository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.repository = this.connectionManager.getHeartbeatRepository();
    }
    return this.repository;
  }
}
