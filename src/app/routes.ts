import { Router } from 'express';
import podcastController from './controllers/podcast.controller';
import { Request, Response } from 'express';

const router = Router();

const healthCheck = (req: any, res: any) => {
  return res.status(200).json({ status: "ok" });
};

router.post("/add-episode", podcastController.addEpisode as any);
router.post("/update-episodes", podcastController.updateEpisodes as any);
router.get("/episodes", podcastController.listEpisodes as any);
router.get("/rss", podcastController.getRss as any);
router.get("/api/cron", podcastController.updateEpisodes as any);
router.get("/health", healthCheck as any);

export default router;
