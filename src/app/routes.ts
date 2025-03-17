import { Router } from 'express';
import podcastController from './controllers/podcast.controller';

const router = Router();

router.post("/add-episode", podcastController.addEpisode as any);
router.post("/update-episodes", podcastController.updateEpisodes as any);
router.get("/episodes", podcastController.listEpisodes as any);
router.get("/rss", podcastController.getRss as any);

export default router;
