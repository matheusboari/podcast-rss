import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";

const DOWNLOAD_FOLDER = path.resolve(__dirname, "downloads");

if (!fs.existsSync(DOWNLOAD_FOLDER)) {
  fs.mkdirSync(DOWNLOAD_FOLDER);
}

export const downloadAudioFromYouTube = async (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputFilePath = path.join(DOWNLOAD_FOLDER, `audio.mp3`);

    const command = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o "${outputFilePath}" ${videoUrl}`;

    console.log("🔄 Baixando áudio do YouTube...");
    exec(command, (error) => {
      if (error) {
        console.error("❌ Erro ao baixar áudio:", error);
        reject(error);
      } else {
        console.log("✅ Download concluído:", outputFilePath);
        resolve(outputFilePath);
      }
    });
  });
};
