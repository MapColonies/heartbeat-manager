import { LessThan } from 'typeorm';
import { FactoryFunction } from 'tsyringe';
import { DataSource } from 'typeorm';
import { HeartbeatEntity } from '../entity/heartbeat';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createHeartbeatRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(HeartbeatEntity).extend({
    async pulse(id: string): Promise<void> {
      const entity = this.create({ id: id, lastHeartbeat: new Date() });
      await this.save(entity);
    },

    async findExpired(duration: number): Promise<string[]> {
      const expiration = new Date(Date.now() - duration);
      const entities = await this.find({
        where: {
          lastHeartbeat: LessThan(expiration),
        },
      });
      return entities.map((entity) => entity.id);
    },

    async removeHeartbeats(ids: string[]): Promise<number> {
      const entities = ids.map((id) => ({ id })) as unknown as HeartbeatEntity[];
      const deleted = await this.remove(entities);
      return deleted.length;
    },
  });
};

export type HeartbeatRepository = ReturnType<typeof createHeartbeatRepository>;

export const heartbeatRepositoryFactory: FactoryFunction<HeartbeatRepository> = (depContainer) => {
  return createHeartbeatRepository(depContainer.resolve<DataSource>(DataSource));
};

export const HEARTBEAT_REPOSITORY_SYMBOL = Symbol('HEARTBEAT_REPOSITORY');
