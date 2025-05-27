import express, { Request, Response } from 'express';
import cors from "cors";
import path from "path";
import mongoose from 'mongoose';
import routes from './app/routes';
import { ENV } from './settings';

mongoose.connect(process.env.MONGO_URL as string).then(() => {
  console.log('✅ Conectado ao MongoDB Atlas');
}).catch((err) => {
  console.error('❌ Erro ao conectar ao MongoDB Atlas:', err);
});

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
    this.server.use(express.static(path.join(__dirname, '../public')));
  }

  private routes(): void {
    this.server.use('/api/v1', routes);
  }
}

export default new App().server;
