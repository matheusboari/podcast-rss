import { Router } from 'express';
import podcastController from './controllers/podcast.controller';

const router = Router();

router.post("/add-episode", podcastController.addEpisode);
router.get("/rss", podcastController.getRss);

export default router;
