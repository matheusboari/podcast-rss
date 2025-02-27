import podcastService from "../services/podcast.service";
import rssService from "../services/rss.service";

let episodes: any[] = [];

class PodcastController {
  async addEpisode(req: any, res: any) {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "É necessário fornecer uma URL do YouTube." });
    }

    try {
      const episode = await podcastService.addPodcast(videoUrl);
      res.json({ message: "Episódio adicionado!", episode });
    } catch (error) {
      res.status(500).json({ error: `Erro ao adicionar episódio. ${error}` });
    }
  }

  async updateEpisodes(_: any, res: any) {
    try {
      
    } catch (error) {
      res.status(500).json({ error: `Erro ao atualizar episódios. ${error}` });
    }
  }

  getRss(_: any, res: any) {
    const rssFeed = rssService.fetchRSSFeed();
  
    res.set("Content-Type", "application/rss+xml");
    res.send(rssFeed);
  }
}

export default new PodcastController();
