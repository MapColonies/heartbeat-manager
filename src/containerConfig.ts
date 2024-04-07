import config from 'config';
import { getOtelMixin } from '@map-colonies/telemetry';
import { trace } from '@opentelemetry/api';
import { DependencyContainer } from 'tsyringe/dist/typings/types';
import jsLogger, { LoggerOptions } from '@map-colonies/js-logger';
import { DataSource } from 'typeorm';
import { HealthCheck } from '@godaddy/terminus';
import { instanceCachingFactory } from 'tsyringe';
import { racePromiseWithTimeout } from '@map-colonies/mc-utils';
import { SERVICES, SERVICE_NAME, DB_CONNECTION_TIMEOUT } from './common/constants';
import { tracing } from './common/tracing';
import { InjectionObject, registerDependencies } from './common/dependencyRegistration';
import { heartbeatRouterFactory, HEARTBEAT_ROUTER_SYMBOL } from './heartbeat/routes/heartbeatRouter';
import { IDbConfig } from './common/interfaces';
import { initConnection } from './DAL/utils/createConnection';
import { HEARTBEAT_REPOSITORY_SYMBOL, heartbeatRepositoryFactory } from './DAL/repositories/heartbeatRepository';

const healthCheck = (connection: DataSource): HealthCheck => {
  return async (): Promise<void> => {
    const check = connection.query('SELECT 1').then(() => {
      return;
    });
    return racePromiseWithTimeout<void>(DB_CONNECTION_TIMEOUT, check);
  };
};
export interface RegisterOptions {
  override?: InjectionObject<unknown>[];
  useChild?: boolean;
}

export const registerExternalValues = async (options?: RegisterOptions): Promise<DependencyContainer> => {
  const loggerConfig = config.get<LoggerOptions>('telemetry.logger');
  const logger = jsLogger({ ...loggerConfig, prettyPrint: loggerConfig.prettyPrint, mixin: getOtelMixin() });
  logger.info('registering external values');
  const connectionOptions = config.get<IDbConfig>('typeOrm');
  const connection = await initConnection(connectionOptions);
  logger.info('Connected to DB');

  tracing.start();
  const tracer = trace.getTracer(SERVICE_NAME);

  const dependencies: InjectionObject<unknown>[] = [
    { token: SERVICES.CONFIG, provider: { useValue: config } },
    { token: SERVICES.LOGGER, provider: { useValue: logger } },
    { token: SERVICES.TRACER, provider: { useValue: tracer } },
    { token: HEARTBEAT_ROUTER_SYMBOL, provider: { useFactory: heartbeatRouterFactory } },
    { token: DataSource, provider: { useValue: connection } },
    {
      token: 'onSignal',
      provider: {
        useValue: {
          useValue: async (): Promise<void> => {
            await Promise.all([tracing.stop()]);
          },
        },
      },
    },
    {
      token: SERVICES.HEALTH_CHECK,
      provider: {
        useFactory: instanceCachingFactory((container) => {
          const connection = container.resolve(DataSource);
          return healthCheck(connection);
        }),
      },
    },
    { token: HEARTBEAT_REPOSITORY_SYMBOL, provider: { useFactory: instanceCachingFactory((c) => heartbeatRepositoryFactory(c)) } },
  ];

  return registerDependencies(dependencies, options?.override, options?.useChild);
};
