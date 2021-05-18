import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getExpiredHeartbeats(duration: number): Promise<supertest.Response> {
  return supertest.agent(app).get(`/heartbeat/expired/${duration}`).set('Content-Type', 'application/json');
}

export async function pulse(id: string): Promise<supertest.Response> {
  return supertest.agent(app).post(`/heartbeat/${id}`).set('Content-Type', 'application/json');
}

export async function removeHeartbeats(ids: string[] | Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).post(`/heartbeat/remove`).set('Content-Type', 'application/json').send(ids);
}
