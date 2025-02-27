import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { downloadAudioFromYouTube } from "./services/youtubeDownloader";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// substituir por um banco de dados (postgres)
let episodes: any[] = [];

app.post("/add-episode", (req: any, res: any) => {
  const { title, description, audioUrl, pubDate } = req.body;

  if (!title || !audioUrl || !pubDate) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  episodes.push({ title, description, audioUrl, pubDate });

  res.json({ message: "Episódio adicionado com sucesso!" });
});

app.get("/rss", (req, res) => {
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
});

app.post("/download-youtube", async (req: any, res: any) => {
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: "É necessário fornecer uma URL do YouTube." });
  }

  try {
    const audioPath = await downloadAudioFromYouTube(videoUrl);
    res.json({ message: "Download concluído!", audioPath });
  } catch (error) {
    res.status(500).json({ error: "Erro ao baixar áudio." });
  }
});


// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
