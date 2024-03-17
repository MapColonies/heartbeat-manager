import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { HeartbeatController } from '../controllers/heartbeatController';

const heartbeatRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(HeartbeatController);

  router.get('/expired/:duration', controller.getExpiredHeartbeats);
  router.post('/remove', controller.removeHeartbeats);
  router.post('/:id', controller.pulse);

  return router;
};

export const RECORD_ROUTER_SYMBOL = Symbol('HeartbeatRouterFactory');

export { heartbeatRouterFactory };
