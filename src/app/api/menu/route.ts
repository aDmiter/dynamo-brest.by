// src/app/api/menu/route.ts - API для управления меню
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSiteLangFromRequest } from '@/lib/content-translations-server';
import {
  loadBeTranslationsMap,
  localizeCmsPageRecord,
  saveBeContentTranslations,
} from '@/lib/content-translations';
import { resolveMenuItemPublicUrl } from '@/lib/site-page-meta';

type MenuNode = {
  id: string;
  title: string;
  subtitle: string | null;
  pageContent: string | null;
  type: string;
  slug: string;
  linkUrl: string | null;
  href?: string;
  children?: MenuNode[];
};

async function enrichMenuWithPublicUrls(items: MenuNode[]): Promise<MenuNode[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      href: await resolveMenuItemPublicUrl(item),
      children: item.children?.length ? await enrichMenuWithPublicUrls(item.children) : [],
    }))
  );
}

function localizeMenuTree(
  items: MenuNode[],
  lang: ReturnType<typeof getSiteLangFromRequest>,
  translations: Map<string, Record<string, string>>,
): MenuNode[] {
  return items.map((item) => {
    const localized = localizeCmsPageRecord(item, lang, translations);
    return {
      ...localized,
      children: item.children?.length
        ? localizeMenuTree(item.children, lang, translations)
        : [],
    };
  });
}

// GET — получить дерево меню
export async function GET(request: NextRequest) {
  const forPublic = request.nextUrl.searchParams.get('public') === '1';
  const lang = forPublic ? getSiteLangFromRequest(request) : 'ru';

  const menu = await prisma.menuitem.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  const menuTree = menu as unknown as MenuNode[];
  const withUrls = forPublic ? await enrichMenuWithPublicUrls(menuTree) : menuTree;

  if (lang !== 'be') {
    return NextResponse.json(withUrls);
  }

  const ids: string[] = [];
  for (const section of withUrls) {
    ids.push(section.id);
    for (const child of section.children) ids.push(child.id);
  }
  const tr = await loadBeTranslationsMap('menuitem', ids);
  return NextResponse.json(localizeMenuTree(withUrls, lang, tr));
}

// POST — создать новый пункт меню
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const item = await prisma.menuitem.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        type: data.type || 'link',
        linkUrl: data.linkUrl || null,
        pageContent: data.pageContent || null,
        imageUrl: data.imageUrl || null,
        subtitle: data.subtitle || null,
        heroHeader: data.heroHeader ?? false,
        parentId: data.parentId || null,
        order: data.order || 0,
        isActive: data.isActive ?? true,
        isExternal: data.isExternal ?? false,
        icon: data.icon || null,
      },
    });

    if (data.be && typeof data.be === 'object') {
      await saveBeContentTranslations('menuitem', item.id, data.be);
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
