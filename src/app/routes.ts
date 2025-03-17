import { Router } from 'express';
import podcastController from './controllers/podcast.controller';
import { authMiddleware } from './middlewares/auth.middleware';

const router = Router();

const healthCheck = (req: any, res: any) => {
  return res.status(200).json({ status: "ok" });
};

// Rotas que precisam de autenticação
router.post("/add-episode", authMiddleware, podcastController.addEpisode as any);
router.post("/update-episodes", authMiddleware, podcastController.updateEpisodes as any);

// Rotas públicas
router.get("/episodes", podcastController.listEpisodes as any);
router.get("/rss", podcastController.getRss as any);
router.get("/api/cron", podcastController.updateEpisodes as any);
router.get("/health", healthCheck as any);
router.get("/test", (req: any, res: any) => {
  return res.status(200).json({ 
    message: "API está funcionando corretamente",
    timestamp: new Date().toISOString()
  });
});

export default router;
