import express from 'express';

import allowCors from './app/middlewares/allowCors';
import routes from './app/routes';

class App {
  public server: express.Express;

  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.server.use(allowCors);
    this.server.use(express.json({ limit: '50mb' }));
    this.server.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    this.server.use('/api/v1', routes);
  }
}

const app = new App();

export default app.server;
