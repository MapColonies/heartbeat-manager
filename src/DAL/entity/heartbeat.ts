import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
import { IHeartbeatEntity } from '../models/heartbeat';

@Entity('Heartbeat')
export class HeartbeatEntity implements IHeartbeatEntity {
  @PrimaryColumn('varchar', { length: 60 })
  public id: string;

  @Index()
  @Column({
    type: 'timestamp without time zone',
  })
  public lastHeartbeat: Date;
}
