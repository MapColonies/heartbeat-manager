// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { createServer } from 'http';
import { Logger } from '@map-colonies/js-logger';
import { createTerminus } from '@godaddy/terminus';
import { container } from 'tsyringe';
import config from 'config';
import { DEFAULT_SERVER_PORT, SERVICES } from './common/constants';
import { getApp } from './app';
import { tracing } from './common/tracing';

const port: number = config.get<number>('server.port') || DEFAULT_SERVER_PORT;

const app = getApp(tracing);

const logger = container.resolve<Logger>(SERVICES.LOGGER);
const stubHealthcheck = async (): Promise<void> => Promise.resolve();
// eslint-disable-next-line @typescript-eslint/naming-convention
const server = createTerminus(createServer(app), { healthChecks: { '/liveness': stubHealthcheck, onSignal: container.resolve('onSignal') } });

server.listen(port, () => {
  logger.info(`app started on port ${port}`);
});
