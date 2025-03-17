import 'dotenv/config';
import fs from "fs-extra";
import path from "path";

export const DOWNLOAD_FOLDER_PATH = path.resolve(__dirname, "..", "..", "..", "downloads");

if (!fs.existsSync(DOWNLOAD_FOLDER_PATH)) {
  fs.mkdirSync(DOWNLOAD_FOLDER_PATH);
}

export const PORT = process.env.NODE_PORT || 3333;
export const ENV = (process.env.NODE_ENV || 'development').trim();

export const {
  DATABASE_URL,
  JWT_SECRET,
  DATABASE_USER,
  DATABASE_PASS,
  DATABASE_NAME,
  CLOUD_NAME,
  API_KEY,
  API_SECRET,
  YOUTUBE_CHANNEL_ID,
  RSS_TITLE,
  RSS_DESCRIPTION,
  RSS_LINK,
  RSS_LANGUAGE,
} = process.env;
