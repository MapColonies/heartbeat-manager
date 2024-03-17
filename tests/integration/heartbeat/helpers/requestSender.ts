import * as supertest from 'supertest';

export class HeartbeatRequestSender {
  public constructor(private readonly app: Express.Application) {}

  public async getExpiredHeartbeats(duration: number): Promise<supertest.Response> {
    return supertest.agent(this.app).get(`/heartbeat/expired/${duration}`).set('Content-Type', 'application/json');
  }

  public async pulse(id: string): Promise<supertest.Response> {
    return supertest.agent(this.app).post(`/heartbeat/${id}`).set('Content-Type', 'application/json');
  }

  public async removeHeartbeats(ids: string[] | Record<string, unknown>): Promise<supertest.Response> {
    return supertest.agent(this.app).post(`/heartbeat/remove`).set('Content-Type', 'application/json').send(ids);
  }
}
