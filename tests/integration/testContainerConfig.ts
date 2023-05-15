import { container } from 'tsyringe';
import config from 'config';
import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import { SERVICE_NAME, Services } from '../../src/common/constants';
import { tracing } from '../../src/common/tracing';

function registerTestValues(): void {
  container.register(Services.CONFIG, { useValue: config });
  container.register(Services.LOGGER, { useValue: jsLogger({ enabled: false }) });

  tracing.start();
  const tracer = trace.getTracer(SERVICE_NAME);
  container.register(Services.TRACER, { useValue: tracer });
}

export { registerTestValues };
