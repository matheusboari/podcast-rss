import podcastService from "../services/podcast.service";

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

  getRss(req: any, res: any) {
    const rssFeed = `
    <?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Meu Podcast Automático</title>
        <link>https://seusite.com</link>
        <description>Podcast atualizado automaticamente</description>
        <language>pt-br</language>
        ${episodes
          .map(
            (episode) => `
          <item>
            <title>${episode.title}</title>
            <description>${episode.description || "Sem descrição"}</description>
            <enclosure url="${episode.audioUrl}" type="audio/mpeg" />
            <guid>${episode.audioUrl}</guid>
            <pubDate>${new Date(episode.pubDate).toUTCString()}</pubDate>
          </item>
        `
          )
          .join("\n")}
      </channel>
    </rss>
    `;
  
    res.set("Content-Type", "application/rss+xml");
    res.send(rssFeed);
  }
}

export default new PodcastController();
