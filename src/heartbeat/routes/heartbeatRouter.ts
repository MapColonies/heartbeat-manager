import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { HeartbeatController } from '../controllers/heartbeatController';

const heartbeatRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(HeartbeatController);

  router.get('/expired/:duration', controller.getExpiredHeartbeats);
  router.post('/remove', controller.removeHeartbeats);
  router.post('/:id', controller.pulse);
  router.get('/:id', controller.getHeartbeatByTaskId);

  return router;
};

export const HEARTBEAT_ROUTER_SYMBOL = Symbol('HeartbeatRouterFactory');

export { heartbeatRouterFactory };
