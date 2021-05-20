import { DependencyContainer } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { Probe, Logger as probLogger } from '@map-colonies/mc-probe';
import { Services } from './common/constants';

declare type LogLevels = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// eslint-disable-next-line @typescript-eslint/ban-types
const getLogFunction = (logger: Logger): Function => {
  function log(level: LogLevels, message: string): void;
  function log(message: string): void;
  function log(...args: [string] | [string, string]): void {
    if (args.length === 1) {
      logger.error(args[0]);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (logger[args[0]] != undefined) {
      //avoid "silly" level logs
      logger[args[0]](args[1]);
    }
  }
  return log;
};

export const probeFactory = (container: DependencyContainer): Probe => {
  const logger: Logger = container.resolve(Services.LOGGER);
  const loggerWrap = ({
    log: getLogFunction(logger),
  } as unknown) as probLogger;
  return new Probe(loggerWrap, {
    onSignal: container.resolve('onSignal'),
  });
};
