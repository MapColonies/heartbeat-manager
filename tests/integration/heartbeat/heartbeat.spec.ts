import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import { HeartbeatEntity } from '../../../src/DAL/entity/heartbeat';
import { HeartbeatRepository } from '../../../src/DAL/repositories/heartbeatRepository';
import { RepositoryMocks, initTypeOrmMocks, registerRepository, lessThanMock } from '../../mocks/DBMock';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { HeartbeatRequestSender } from './helpers/requestSender';

let heartbeatRepositoryMocks: RepositoryMocks;

const now = 1620894317;
const nowDate = new Date(now);

describe('heartbeat', function () {
  let requestSender: HeartbeatRequestSender;
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(nowDate);
  });

  beforeEach(function () {
    //registerTestValues();
    initTypeOrmMocks();
    const app = getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
      ],
      useChild: false, //child container is incompatible with the typeorm repositories implementation
    });
    heartbeatRepositoryMocks = registerRepository(HeartbeatRepository, new HeartbeatRepository());
    requestSender = new HeartbeatRequestSender(app);
  });

  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Happy Path', function () {
    it('getExpiredHeartbeats should return status 200 and the expired tasks', async function () {
      const duration = 350000;
      const matchingIds = ['1', '2'];
      const entities = [{ id: '1' }, { id: '2' }];
      heartbeatRepositoryMocks.findMock.mockReturnValue(entities);

      const response = await requestSender.getExpiredHeartbeats(duration);

      expect(response.status).toBe(httpStatusCodes.OK);
      const ids = response.body as string[];
      expect(ids).toEqual(matchingIds);
      expect(lessThanMock).toHaveBeenCalledWith(new Date(now - duration));
      expect(lessThanMock).toHaveBeenCalledTimes(1);
      expect(heartbeatRepositoryMocks.findMock).toHaveBeenCalledTimes(1);
    });

    it('pulse should return 200 status code and save the heartbeat pulse', async function () {
      const id = '1';
      const entity = {
        id: id,
        lastHeartbeat: nowDate,
      } as unknown as HeartbeatEntity;

      const response = await requestSender.pulse(id);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(heartbeatRepositoryMocks.saveMock).toHaveBeenCalledTimes(1);
      expect(heartbeatRepositoryMocks.saveMock).toHaveBeenCalledWith(entity);
    });

    it('removeHeartbeats should return 200 status code and remove records from db', async () => {
      const ids = ['id1', 'id2'];
      const expectedIds = ids.map((id) => ({ id }));
      heartbeatRepositoryMocks.removeMock.mockResolvedValue(expectedIds);

      const response = await requestSender.removeHeartbeats(ids);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(heartbeatRepositoryMocks.removeMock).toHaveBeenCalledTimes(1);
      expect(heartbeatRepositoryMocks.removeMock).toHaveBeenCalledWith(expectedIds);
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
