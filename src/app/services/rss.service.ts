import { PrismaClient } from "@prisma/client";
import { RSS_TITLE, RSS_DESCRIPTION, RSS_LINK, RSS_LANGUAGE } from "../../settings";

const prisma = new PrismaClient();

class RSSService {
  async fetchRSSFeed() {
    const episodes = await prisma.episode.findMany({
      orderBy: {
        pubDate: 'desc'
      }
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
      <rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
        <channel>
          <title>${RSS_TITLE || 'Devocionalmente Podcast'}</title>
          <description>${RSS_DESCRIPTION || 'Podcast Devocionalmente'}</description>
          <link>${RSS_LINK || 'https://devocionalmente.com.br'}</link>
          <image>
            <url>https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded_nologo/11373090/11373090-1605618437111-8b52e9f19e5a6.jpg</url>
            <title>${RSS_TITLE || 'Devocionalmente Podcast'}</title>
            <link>${RSS_LINK || 'https://devocionalmente.com.br'}</link>
          </image>
          <generator>Devocionalmente Podcast Generator</generator>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          <atom:link href="${RSS_LINK || 'https://devocionalmente.com.br'}/rss" rel="self" type="application/rss+xml"/>
          <author>Devocionalmente</author>
          <copyright>Devocionalmente</copyright>
          <language>${RSS_LANGUAGE || 'pt-br'}</language>
          <itunes:author>Devocionalmente</itunes:author>
          <itunes:summary>${RSS_DESCRIPTION || 'Podcast Devocionalmente'}</itunes:summary>
          <itunes:type>episodic</itunes:type>
          <itunes:owner>
            <itunes:name>Devocionalmente</itunes:name>
            <itunes:email>contato@devocionalmente.com.br</itunes:email>
          </itunes:owner>
          <itunes:explicit>false</itunes:explicit>
          <itunes:category text="Religion &amp; Spirituality">
            <itunes:category text="Christianity"/>
          </itunes:category>
          <itunes:image href="https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded_nologo/11373090/11373090-1605618437111-8b52e9f19e5a6.jpg"/>
          ${episodes.map(episode => {
            const pubDate = new Date(episode.pubDate).toUTCString();
            const guid = episode.id;
            
            return `
          <item>
            <title><![CDATA[${episode.title}]]></title>
            <description><![CDATA[${episode.description || 'Sem descrição'}]]></description>
            <link>${episode.videoUrl}</link>
            <guid isPermaLink="false">${guid}</guid>
            <pubDate>${pubDate}</pubDate>
            <enclosure url="${episode.audioUrl}" length="0" type="audio/mpeg"/>
            <itunes:title><![CDATA[${episode.title}]]></itunes:title>
            <itunes:summary><![CDATA[${episode.description || 'Sem descrição'}]]></itunes:summary>
            <itunes:explicit>false</itunes:explicit>
            <itunes:duration>00:00:00</itunes:duration>
            <itunes:image href="https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded_nologo/11373090/11373090-1605618437111-8b52e9f19e5a6.jpg"/>
            <itunes:episodeType>full</itunes:episodeType>
          </item>`;
          }).join('\n')}
        </channel>
      </rss>`;

    return rss;
  }
}

export default new RSSService();
