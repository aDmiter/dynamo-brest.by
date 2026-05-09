// src/app/api/youtube/route.ts - Получение видео с YouTube канала
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = 'UCuHmHyqMQWgC0ySkhkbErUQ';

  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelRes.json();

    if (!channelData.items?.length) {
      return NextResponse.json({ error: 'Канал не найден' }, { status: 404 });
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=4&key=${apiKey}`
    );
    const videosData = await videosRes.json();

    if (!videosData.items) {
      return NextResponse.json({ error: 'Не удалось получить видео' }, { status: 500 });
    }

    // Собираем ID видео для получения статистики
    const videoIds = videosData.items
      .map(
        (item: { snippet: { resourceId: { videoId: string } } }) => item.snippet.resourceId.videoId
      )
      .join(',');

    // Получаем статистику (просмотры)
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`
    );
    const statsData = await statsRes.json();

    // Маппинг статистики по videoId
    const statsMap: Record<string, string> = {};
    statsData.items?.forEach((item: { id: string; statistics: { viewCount: string } }) => {
      statsMap[item.id] = item.statistics?.viewCount || '0';
    });

    const videos = videosData.items.map(
      (item: {
        snippet: {
          resourceId: { videoId: string };
          title: string;
          thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
          };
        };
      }) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url ||
          '',
        views: statsMap[item.snippet.resourceId.videoId] || '0',
      })
    );

    return NextResponse.json({ videos });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
