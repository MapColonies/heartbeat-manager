export interface IHeartbeatEntity {
  /** The ID of the heartbeat Entity. */
  id: string;
  /** Automatically generated date when the given task was created. */
  lastHeartbeat: Date;
}
