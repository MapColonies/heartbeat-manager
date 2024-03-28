/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from 'tsyringe';
import { DataSource } from 'typeorm';
import httpStatusCodes from 'http-status-codes';
import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import { HeartbeatRepository, HEARTBEAT_REPOSITORY_SYMBOL } from '../../../src/DAL/repositories/heartbeatRepository';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { HeartbeatRequestSender } from './helpers/requestSender';

describe('heartbeat', function () {
  let requestSender: HeartbeatRequestSender;
  let repo: HeartbeatRepository;
  let depContainer: DependencyContainer;
  let saveSpy: jest.SpyInstance;
  let findSpy: jest.SpyInstance;
  beforeAll(async function () {
    const [app, container] = await getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
      ],
      useChild: true,
    });
    requestSender = new HeartbeatRequestSender(app);
    depContainer = container;
    repo = depContainer.resolve(HEARTBEAT_REPOSITORY_SYMBOL);
  });

  beforeEach(function () {
    saveSpy = jest.spyOn(repo, 'save');
    findSpy = jest.spyOn(repo, 'find');
  });

  afterEach(function () {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  afterAll(async function () {
    await depContainer.resolve(DataSource).destroy();
  });

  describe('Happy Path', function () {
    it('pulse should return 200 status code and save the heartbeat pulse', async function () {
      const id = '1';
      saveSpy = jest.spyOn(repo, 'save');
      const response = await requestSender.pulse(id);

      //expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('getExpiredHeartbeats should return status 200 and the expired tasks', async function () {
      const duration = 1;
      const matchingIds = ['1', '2'];
      saveSpy = jest.spyOn(repo, 'save');
      findSpy = jest.spyOn(repo, 'find');
      await requestSender.pulse('1');
      await requestSender.pulse('2');

      const response = await requestSender.getExpiredHeartbeats(duration);

      expect(response.status).toBe(httpStatusCodes.OK);
      const ids = response.body as string[];
      expect(ids).toEqual(matchingIds);
      expect(findSpy).toHaveBeenCalledTimes(1);
    });

    it('removeHeartbeats should return 200 status code and remove records from db', async () => {
      const ids = ['id1', 'id2'];
      const response = await requestSender.removeHeartbeats(ids);

      //expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });
  });

  describe('Bad Path', function () {
    it('removeHeartbeats should return 400 when data is not string array', async () => {
      const data = {
        id: 'id1',
      };

      const response = await requestSender.removeHeartbeats(data);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    });
  });
});
