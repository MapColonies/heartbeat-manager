import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('Heartbeat')
export class HeartbeatEntity {
  @PrimaryColumn('varchar', { length: 60 })
  public taskId: string;

  @Index()
  @Column()
  public lastHeartbeat: Date;

  public constructor();
  public constructor(init: Partial<HeartbeatEntity>);
  public constructor(...args: [] | [Partial<HeartbeatEntity>]) {
    if (args.length === 1) {
      Object.assign(this, args[0]);
    }
  }
}
