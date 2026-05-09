// prisma/import-news.ts - Импорт новостей из K2 (Joomla)
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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
  };
  return text
    .toLowerCase()
    .split('')
    .map((c) => ru[c] || c)
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

const categoryMap: Record<string, string> = {
  '1': 'general',
  '2': 'polls',
  '4': 'events',
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
  '22': 'history',
  '23': 'women',
  '24': 'eurocups',
};

// Функция для парсинга одной CSV-записи (может занимать несколько строк)
function parseSingleRecord(
  lines: string[],
  startIndex: number
): { record: string[] | null; nextIndex: number } {
  let combined = lines[startIndex];
  let i = startIndex;

  // Считаем кавычки — если нечётное, значит запись не закончилась
  while (combined.split('"').length % 2 === 0 && i + 1 < lines.length) {
    i++;
    combined += '\n' + lines[i];
  }

  // Парсим собранную строку
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let j = 0; j < combined.length; j++) {
    const char = combined[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());

  // Убираем обрамляющие кавычки у каждого поля
  const clean = parts.map((p) => p.replace(/^"|"$/g, ''));

  return { record: clean.length >= 7 ? clean : null, nextIndex: i + 1 };
}

async function importNews() {
  const filePath = path.join(__dirname, 'k2_items.csv');

  if (!fs.existsSync(filePath)) {
    console.error('Файл k2_items.csv не найден');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  if (lines.length < 2) {
    console.error('Файл пуст');
    process.exit(1);
  }

  console.log(`Всего строк в файле: ${lines.length}`);
  console.log('Заголовок:', lines[0].substring(0, 100));

  let imported = 0;
  let skipped = 0;
  let i = 1;

  while (i < lines.length) {
    const { record, nextIndex } = parseSingleRecord(lines, i);
    i = nextIndex;

    if (!record || record.length < 5) {
      skipped++;
      if (skipped <= 3)
        console.log(`Пропущена строка ${i}: недостаточно полей (${record?.length || 0})`);
      continue;
    }

    const title = record[0];
    const alias = record[1];
    const introtext = record[2];
    const catid = record[3];
    const created = record[4];
    const published = record.length > 5 ? record[5] : '1';
    const featured = record.length > 6 ? record[6] : '0';

    if (!title) {
      skipped++;
      continue;
    }

    let slug = alias || transliterate(title);

    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) {
      slug = slug + '-' + Date.now().toString().slice(-6);
    }

    let publishDate = new Date();
    if (created && created.length > 10) {
      const parsed = new Date(created);
      if (!isNaN(parsed.getTime())) {
        publishDate = parsed;
      }
    }

    if (imported === 0) {
      console.log('Первая запись:');
      console.log('  title:', title);
      console.log('  created:', created);
      console.log('  parsed date:', publishDate.toISOString());
    }

    const excerpt = introtext
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, '')
      .substring(0, 200)
      .trim();

    try {
      await prisma.news.create({
        data: {
          title,
          slug,
          content: introtext,
          excerpt: excerpt || title,
          category: categoryMap[catid] || 'general',
          isFeatured: featured === '1',
          isPublished: published === '1',
          publishedAt: publishDate,
        },
      });
      imported++;
      if (imported % 10 === 0) console.log(`Импортировано ${imported}...`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('Unique constraint')) {
        console.error(`Ошибка "${title.substring(0, 40)}": ${message}`);
      }
      skipped++;
    }
  }

  console.log(`\nГотово! Импортировано: ${imported}, пропущено: ${skipped}`);
}

importNews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
