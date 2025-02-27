import express from 'express';
import cors from "cors";

import routes from './app/routes';

class App {
  public server: express.Express;

  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.server.use(cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
    }));
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    this.server.use('/api/v1', routes);
  }
}

const app = new App();

export default app.server;
