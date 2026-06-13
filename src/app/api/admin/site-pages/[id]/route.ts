import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { prisma } from '@/lib/prisma';
import {
  normalizeSitePath,
  syncMenuLinksForSitePageRedirect,
} from '@/lib/site-page-meta';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminSection('settings');
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const existing = await prisma.sitePageMeta.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Страница не найдена' }, { status: 404 });
    }

    const data = await request.json();
    const update: {
      title?: string | null;
      description?: string | null;
      redirectTo?: string | null;
    } = {};

    if (data.title !== undefined) {
      update.title = String(data.title).trim() || null;
    }
    if (data.description !== undefined) {
      update.description = String(data.description).trim() || null;
    }
    if (data.redirectTo !== undefined) {
      const raw = String(data.redirectTo).trim();
      if (!raw) {
        update.redirectTo = null;
      } else {
        const redirectTo = raw.startsWith('/') ? normalizeSitePath(raw) : raw;
        if (redirectTo === existing.path) {
          return NextResponse.json(
            { error: 'Редирект не может указывать на ту же страницу' },
            { status: 400 }
          );
        }
        update.redirectTo = redirectTo;
      }
    }

    const page = await prisma.sitePageMeta.update({
      where: { id },
      data: update,
    });

    if (update.redirectTo === null && existing.redirectTo?.trim()) {
      const oldPublicPath = normalizeSitePath(existing.redirectTo);
      if (oldPublicPath.startsWith('/')) {
        await syncMenuLinksForSitePageRedirect(oldPublicPath, existing.path);
      }
    } else if (update.redirectTo && existing.path.startsWith('/')) {
      const publicPath = normalizeSitePath(update.redirectTo);
      if (publicPath.startsWith('/')) {
        await syncMenuLinksForSitePageRedirect(existing.path, publicPath);
      }
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('PATCH /api/admin/site-pages/[id]:', error);
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 });
  }
}
