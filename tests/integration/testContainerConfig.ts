import { container } from 'tsyringe';
import config from 'config';
import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import { SERVICE_NAME, SERVICES } from '../../src/common/constants';
import { tracing } from '../../src/common/tracing';

function registerTestValues(): void {
  container.register(SERVICES.CONFIG, { useValue: config });
  container.register(SERVICES.LOGGER, { useValue: jsLogger({ enabled: false }) });

  tracing.start();
  const tracer = trace.getTracer(SERVICE_NAME);
  container.register(SERVICES.TRACER, { useValue: tracer });
}

export { registerTestValues };
