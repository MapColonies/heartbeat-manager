/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from 'tsyringe';
import { DataSource } from 'typeorm';
import httpStatusCodes from 'http-status-codes';
import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import { v4 as uuidv4 } from 'uuid';
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
      const id = uuidv4();
      saveSpy = jest.spyOn(repo, 'save');
      const response = await requestSender.pulse(id);
      //TODO: fix code to enable toSatisfyApiSpec to work
      //expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(saveSpy).toHaveBeenCalledTimes(1);

      await requestSender.removeHeartbeats([id]);
    });

    it('getExpiredHeartbeats should return status 200 and the expired tasks', async function () {
      const duration = 1;
      const matchingIds = [uuidv4(), uuidv4()];
      saveSpy = jest.spyOn(repo, 'save');
      findSpy = jest.spyOn(repo, 'find');
      await requestSender.pulse(matchingIds[0]);
      await requestSender.pulse(matchingIds[1]);

      const response = await requestSender.getExpiredHeartbeats(duration);
      //TODO: fix code to enable toSatisfyApiSpec to work
      //expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      const ids = response.body as string[];
      expect(ids).toEqual(matchingIds);
      expect(findSpy).toHaveBeenCalledTimes(1);

      await requestSender.removeHeartbeats(matchingIds);
    });

    it('removeHeartbeats should return 200 status code and remove records from db', async () => {
      const ids = [uuidv4(), uuidv4()];
      const response = await requestSender.removeHeartbeats(ids);

      //TODO: fix code to enable toSatisfyApiSpec to work
      //expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });
  });

  describe('Bad Path', function () {
    it('removeHeartbeats should return 400 when data is not string array', async () => {
      const data = {
        id: uuidv4(),
      };

      const response = await requestSender.removeHeartbeats(data);
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    });

    it('post heartbeat should return 400 if given heartbeat id is not uuid', async () => {
      const badId = '1';
      const response = await requestSender.pulse(badId);
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    });
  });

  describe('GetHeartbeat', function () {
    describe('Happy path', function () {
      it('if heartbeat exist for id, should return 200 with heartbeat row', async () => {
        const id = uuidv4();

        await requestSender.pulse(id);
        const response = await requestSender.getHeartbeat(id);
        expect(response.body).toHaveProperty('id', id);
        expect(response.body).toHaveProperty('lastHeartbeat');
        expect(new Date(response.body.lastHeartbeat)).toBeInstanceOf(Date);

        await requestSender.removeHeartbeats([id]);
      });
    });

    describe('Bad path', function () {
      it("if heartbeat doesn't exist for id, should return 404", async () => {
        const missingId = uuidv4();

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
