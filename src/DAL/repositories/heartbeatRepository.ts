import { container } from 'tsyringe';
import { EntityRepository, LessThan, Repository } from 'typeorm';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '../../common/constants';
import { HeartbeatEntity } from '../entity/heartbeat';

@EntityRepository(HeartbeatEntity)
export class HeartbeatRepository extends Repository<HeartbeatEntity> {
  private readonly appLogger: Logger; //don't override internal repository logger.

  public constructor() {
    super();
    //direct injection don't work here due to being initialized by typeOrm
    this.appLogger = container.resolve(SERVICES.LOGGER);
  }

  public async pulse(id: string): Promise<void> {
    const entity = new HeartbeatEntity({
      id: id,
      lastHeartbeat: new Date(),
    });
    await this.save(entity);
  }

  public async findExpired(duration: number): Promise<string[]> {
    const expiration = new Date(Date.now() - duration);
    const entities = await this.find({
      where: {
        lastHeartbeat: LessThan(expiration),
      },
    });
    return entities.map((entity) => entity.id);
  }

  public async removeHeartbeats(ids: string[]): Promise<number> {
    const entities = ids.map((id) => ({ id })) as unknown as HeartbeatEntity[];
    const deleted = await this.remove(entities);
    this.appLogger.debug(`removed heartbeats: ${deleted.map((entity) => entity.id).join()}`);
    return deleted.length;
  }
}
