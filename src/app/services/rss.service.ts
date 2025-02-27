import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class RSSService {
  async fetchRSSFeed() {
    const episodes = await prisma.episode.findMany();

    const rss = `
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

    return rss;
  }
}

export default new RSSService();
