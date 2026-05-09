// prisma/import-news.ts - Импорт новостей из K2 (Joomla)
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Транслитерация для slug
function transliterate(text: string): string {
  const ru: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    ' ': '-',
    _: '-',
    ',': '',
    '.': '',
    '!': '',
    '?': '',
    '"': '',
    "'": '',
    ':': '',
    ';': '',
    '(': '',
    ')': '',
    '[': '',
    ']': '',
    '{': '',
    '}': '',
    '«': '',
    '»': '',
    '–': '-',
    '—': '-',
    '/': '-',
    '\\': '-',
    '|': '-',
    '+': '-',
    '=': '-',
    '*': '',
    '&': 'and',
    '@': '',
    '#': '',
    $: '',
    '%': '',
    '^': '',
    '~': '',
    '`': '',
  };

  return text
    .toLowerCase()
    .split('')
    .map((char) => ru[char] || char)
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

// Маппинг категорий
const categoryMap: Record<string, string> = {
  '1': 'general',
  '5': 'press',
  '6': 'youth',
  '7': 'academy',
  '8': 'club',
  '9': 'partners',
  '10': 'shop',
  '11': 'tickets',
  '13': 'video',
  '14': 'school',
  '15': 'first-team',
  '16': 'interviews',
  '17': 'season',
  '18': 'transfers',
  '19': 'friendly',
  '20': 'cup',
  '23': 'women',
  '24': 'eurocups',
};

// Парсинг CSV с учётом экранированных запятых
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function importNews() {
  const filePath = path.join(__dirname, 'k2_items.csv');

  if (!fs.existsSync(filePath)) {
    console.error('Файл k2_items.csv не найден в папке prisma/');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');

  if (lines.length < 2) {
    console.error('Файл пуст или содержит только заголовок');
    process.exit(1);
  }

  // Первая строка — заголовки
  const headers = parseCSVLine(lines[0]);
  console.log('Заголовки:', headers);

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length === 0) continue;

    // Собираем объект из заголовков и значений
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const title = row['title'];
    const alias = row['alias'];
    const introtext = row['introtext'] || '';
    const catid = row['catid'];
    const created = row['created'];

    if (!title) {
      skipped++;
      continue;
    }

    // Slug: используем alias из K2 или генерируем
    let slug = alias || transliterate(title);

    // Проверяем уникальность slug
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) {
      slug = slug + '-' + Date.now().toString().slice(-6);
    }

    try {
      await prisma.news.create({
        data: {
          title,
          slug,
          content: introtext,
          excerpt: introtext.replace(/<[^>]*>/g, '').substring(0, 200),
          category: categoryMap[catid] || 'general',
          isPublished: true,
          publishedAt: created ? new Date(created) : new Date(),
        },
      });
      imported++;
      if (imported % 100 === 0) {
        console.log(`Импортировано ${imported}...`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Ошибка импорта "${title}":`, message);
      skipped++;
    }
  }

  console.log(`\nГотово! Импортировано: ${imported}, пропущено: ${skipped}`);
}

importNews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
