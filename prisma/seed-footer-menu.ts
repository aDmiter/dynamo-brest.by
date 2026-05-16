/**
 * Сид нижнего меню и импорт HTML со старого сайта.
 * Запуск: npx tsx prisma/seed-footer-menu.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE = 'https://dynamo-brest.by';

type SeedItem = {
  block: number;
  order: number;
  title: string;
  slug: string;
  type: 'page' | 'link';
  linkUrl?: string;
  isExternal?: boolean;
  oldPath?: string;
};

const ITEMS: SeedItem[] = [
  {
    block: 1,
    order: 0,
    title: 'Обращения граждан',
    slug: 'obrashcheniya-grazhdan',
    type: 'page',
    oldPath: '/obrashcheniya-grazhdan',
  },
  {
    block: 1,
    order: 1,
    title: 'Коррупция',
    slug: 'korruptsiya',
    type: 'page',
    oldPath: '/korruptsiya',
  },
  {
    block: 1,
    order: 2,
    title: 'Антидопинг',
    slug: 'antidoping',
    type: 'link',
    linkUrl: 'https://nada.by/doping/PageAntidoping.html',
    isExternal: true,
  },
  {
    block: 1,
    order: 3,
    title: 'молодежь.бел',
    slug: 'molodezh-bel',
    type: 'link',
    linkUrl: 'https://молодежь.бел',
    isExternal: true,
  },
  {
    block: 1,
    order: 4,
    title: 'Политика обработки персональных данных',
    slug: 'politika-obrabotki-personalnykh-dannykh',
    type: 'page',
    oldPath: '/politika-obrabotki-personalnykh-dannykh',
  },
  {
    block: 1,
    order: 5,
    title: 'Политика в отношении обработки cookies',
    slug: 'politika-v-otnoshenii-obrabotki-cookies',
    type: 'page',
    oldPath: '/politika-v-otnoshenii-obrabotki-cookies',
  },
  {
    block: 1,
    order: 6,
    title: 'Политика видеонаблюдения',
    slug: 'politika-videonablyudeniya',
    type: 'page',
    oldPath: '/politika-videonablyudeniya',
  },
  {
    block: 2,
    order: 0,
    title: 'Пользовательское соглашение',
    slug: 'polzovatelskoe-soglashenie',
    type: 'page',
    oldPath: '/polzovatelskoe-soglashenie',
  },
  {
    block: 2,
    order: 1,
    title: 'Правила использования cookie',
    slug: 'pravila-ispolzovaniya-cookie',
    type: 'page',
    oldPath: '/pravila-ispolzovaniya-cookie',
  },
  {
    block: 2,
    order: 2,
    title: 'No to racism',
    slug: 'no-to-racism',
    type: 'page',
    oldPath: '/no-to-racism',
  },
];

function extractArticleBody(html: string): string {
  const match = html.match(/itemprop=["']articleBody["'][^>]*>/i);
  if (!match) return '';

  const start = html.indexOf(match[0]) + match[0].length;
  let depth = 1;
  let pos = start;

  while (pos < html.length && depth > 0) {
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) break;

    const openIdx = html.indexOf('<div', pos);
    const useOpen = openIdx !== -1 && openIdx < nextClose ? openIdx : -1;

    if (useOpen !== -1) {
      depth += 1;
      pos = useOpen + 4;
    } else {
      depth -= 1;
      if (depth === 0) {
        return normalizeArticleHtml(html.slice(start, nextClose));
      }
      pos = nextClose + 6;
    }
  }

  return '';
}

function normalizeArticleHtml(raw: string): string {
  let content = raw.trim();

  const pdfMatch = content.match(/var\s+pdf\s*=\s*["']([^"']+)["']/);
  if (content.includes('su-flipbook') && pdfMatch) {
    const pdfUrl = pdfMatch[1].replace(/\\\//g, '/');
    content = `<p><a href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Открыть документ (PDF)</a></p>`;
  }

  content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  content = content.replace(/src="\/images\//g, `src="${BASE}/images/`);
  content = content.replace(/href="\/images\//g, `href="${BASE}/images/`);
  content = content.replace(/href="\/(?!\/)/g, `href="${BASE}/`);
  return content.trim();
}

async function fetchPageContent(path: string): Promise<string> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'User-Agent': 'DynamoBrestSeed/1.0' },
    });
    if (!res.ok) {
      console.warn(`  ⚠ ${path}: HTTP ${res.status}`);
      return '';
    }
    const html = await res.text();
    const body = extractArticleBody(html);
    if (!body) console.warn(`  ⚠ ${path}: articleBody не найден`);
    return body;
  } catch (e) {
    console.warn(`  ⚠ ${path}:`, e);
    return '';
  }
}

async function main() {
  console.log('Нижнее меню: контакты…');
  await prisma.footercontacts.upsert({
    where: { id: 'main' },
    create: {
      id: 'main',
      title: 'Контакты',
      email: 'info@dynamo-brest.by',
      addressLabel: 'Адрес офиса в Бресте',
      address: 'г. Брест, ул. Гоголя, 9',
    },
    update: {},
  });

  console.log('Нижнее меню: пункты…');
  for (const item of ITEMS) {
    let pageContent: string | null = null;
    if (item.type === 'page' && item.oldPath) {
      console.log(`  → ${item.oldPath}`);
      pageContent = (await fetchPageContent(item.oldPath)) || null;
      await new Promise((r) => setTimeout(r, 400));
    }

    await prisma.footermenuitem.upsert({
      where: { slug: item.slug },
      create: {
        block: item.block,
        title: item.title,
        slug: item.slug,
        type: item.type,
        linkUrl: item.linkUrl ?? null,
        pageContent,
        order: item.order,
        isActive: true,
        isExternal: item.isExternal ?? false,
      },
      update: {
        block: item.block,
        title: item.title,
        type: item.type,
        linkUrl: item.linkUrl ?? null,
        order: item.order,
        isExternal: item.isExternal ?? false,
        ...(item.type === 'page' ? { pageContent } : {}),
      },
    });
    console.log(`  ✓ ${item.title}`);
  }

  console.log('Готово.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
