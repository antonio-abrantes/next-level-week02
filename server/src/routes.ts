import express  from 'express';

import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';

const routes = express.Router();

const classesController = new ClassesController(); 
const connectionController = new ConnectionsController();

routes.get('/', (request, response, next) => {
  return response.send({ message: 'Api ok' });
});

routes.get('/classes', classesController.index);
routes.post('/classes', classesController.create);

routes.get('/connections', connectionController.index);
routes.post('/connections', connectionController.create);

routes.post('/users', (request, response, next) => {
  response.send({ ok: request.body });
});

export default routes;
