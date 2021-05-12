import { container } from 'tsyringe';
import { EntityRepository, LessThan, Repository } from 'typeorm';
import { Logger } from '@map-colonies/js-logger';
import { Services } from '../../common/constants';
import { HeartbeatEntity } from '../entity/heartbeat';

@EntityRepository(HeartbeatEntity)
export class HeartbeatRepository extends Repository<HeartbeatEntity> {
  private readonly appLogger: Logger; //don't override internal repository logger.

  public constructor() {
    super();
    //direct injection don't work here due to being initialized by typeOrm
    this.appLogger = container.resolve(Services.LOGGER);
  }

  public async pulse(taskId: string): Promise<void> {
    const entity = new HeartbeatEntity({
      taskId,
      lastHeartbeat: new Date(),
    });
    await this.save(entity);
  }

  public async findExpired(duration: number): Promise<string[]> {
    const experation = new Date(Date.now() - duration);
    const entities = await this.find({
      where: {
        lastHeartbeat: LessThan(experation),
      },
    });
    return entities.map((entity) => entity.taskId);
  }
}
