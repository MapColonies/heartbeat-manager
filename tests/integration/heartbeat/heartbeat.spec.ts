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
      const id = '513a40b2-783f-4c82-bd1a-5b6a7aca75d5';
      saveSpy = jest.spyOn(repo, 'save');
      const response = await requestSender.pulse(id);
      //TODO: fix code to enable toSatisfyApiSpec to work
      //expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(saveSpy).toHaveBeenCalledTimes(1);

      requestSender.removeHeartbeats([id]);
    });

    it('getExpiredHeartbeats should return status 200 and the expired tasks', async function () {
      const duration = 1;
      const matchingIds = ['7e4eccd1-6bb4-4a52-92c2-2c97bf40219a', '48adcc03-f0a9-4722-b330-a676b140fecc'];
      saveSpy = jest.spyOn(repo, 'save');
      findSpy = jest.spyOn(repo, 'find');
      await requestSender.pulse('7e4eccd1-6bb4-4a52-92c2-2c97bf40219a');
      await requestSender.pulse('48adcc03-f0a9-4722-b330-a676b140fecc');

      const response = await requestSender.getExpiredHeartbeats(duration);
      //TODO: fix code to enable toSatisfyApiSpec to work
      //expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      const ids = response.body as string[];
      expect(ids).toEqual(matchingIds);
      expect(findSpy).toHaveBeenCalledTimes(1);

      requestSender.removeHeartbeats(matchingIds);
    });

    it('removeHeartbeats should return 200 status code and remove records from db', async () => {
      const ids = ['ef6ae24e-cd72-48e6-95bc-6c16444dc33c', '44a01903-c984-4021-8f7f-82efe871c5fe'];
      const response = await requestSender.removeHeartbeats(ids);

      //TODO: fix code to enable toSatisfyApiSpec to work
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

    it('post heartbeat should return 400 if given heartbeat id is not uuid, ', async () => {
      const badId = '1';

      const response = await requestSender.pulse(badId);
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    });
  });

  describe('GetHeartbeat', function () {
    describe('Happy path', function () {
      it('if heartbeat exist for id, should return 200 with heartbeat row', async () => {
        const id = '720d1a04-5a9e-4a3e-beba-6fe980fca516';

        await requestSender.pulse(id);
        const response = await requestSender.getHeartbeat(id);
        expect(response.body.id).toBe(id);
        expect(new Date(response.body.lastHeartbeat)).toBeInstanceOf(Date);

        requestSender.removeHeartbeats([id]);
      });
    });

    describe('Sad path', function () {
      it("if heartbeat doesn't exist for id, should return 404", async () => {
        const missingId = '70183521-94ae-4a74-984f-8863c125b0b5';

        const response = await requestSender.getHeartbeat(missingId);
        expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
      });

      it('if given heartbeat id is not uuid, should return 400', async () => {
        const badId = '1';

        const response = await requestSender.getHeartbeat(badId);
        expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      });
    });
  });
});
