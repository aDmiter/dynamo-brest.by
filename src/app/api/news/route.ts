// src/app/api/news/route.ts - API новостей
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transliterate } from '@/lib/utils';
import { auditCreateData } from '@/lib/admin-audit-route';
import { getSiteLangFromRequest } from '@/lib/content-translations-server';
import {
  loadBeTranslationsMap,
  localizeNewsRecord,
  saveBeContentTranslations,
} from '@/lib/content-translations';

// GET — список новостей с пагинацией
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const skip = (page - 1) * limit;
  const forAdmin = searchParams.get('admin') === '1';
  const lang = forAdmin ? 'ru' : getSiteLangFromRequest(request);

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.news.count({ where: { isPublished: true } }),
  ]);

  let localized = news;
  if (lang === 'be' && news.length > 0) {
    const tr = await loadBeTranslationsMap(
      'news',
      news.map((n) => n.id),
    );
    localized = news.map((n) => localizeNewsRecord(n, lang, tr));
  }

  return NextResponse.json({
    news: localized,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + limit < total,
  });
}

// POST — создать новость
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const slug = data.slug || transliterate(data.title);

    const news = await prisma.news.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || data.content.substring(0, 200) + '...',
        imageUrl: data.imageUrl || null,
        category: data.category || 'general',
        isFeatured: data.isFeatured || false,
        isPublished: data.isPublished ?? true,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        ...(await auditCreateData()),
      },
    });

    if (data.be && typeof data.be === 'object') {
      await saveBeContentTranslations('news', news.id, data.be);
    }

    return NextResponse.json(news, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
