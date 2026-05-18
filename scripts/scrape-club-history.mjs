/**
 * Парсинг /club/about, скачивание картинок, генерация club-history-data.ts
 * Запуск: node scripts/scrape-club-history.mjs [path-to-html]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const BASE_URL = 'https://dynamo-brest.by';
const PUBLIC_DIR = path.join(root, 'public', 'club-history');
const htmlPath = process.argv[2] || path.join(root, 'tmp-club-about.html');

const HIGHLIGHT_YEARS = new Set([1960, 2007, 2017, 2018, 2019, 2020, 2021]);

function decodeHtml(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(html) {
  return decodeHtml(html.replace(/<[^>]+>/g, ' '));
}

function yearSortKey(label) {
  const nums = label.match(/\d{4}/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}

/** /images/... → локальный URL /club-history/... */
function toPublicSrc(imagePath) {
  const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (!normalized.startsWith('/images/')) return null;
  return `/club-history/${normalized.slice('/images/'.length)}`;
}

function toDiskPath(publicSrc) {
  return path.join(root, 'public', publicSrc.replace(/^\//, '').replace(/\//g, path.sep));
}

const downloadCache = new Map();

async function downloadImage(imagePath) {
  const publicSrc = toPublicSrc(imagePath);
  if (!publicSrc) return null;
  if (downloadCache.has(publicSrc)) return publicSrc;

  const diskPath = toDiskPath(publicSrc);
  fs.mkdirSync(path.dirname(diskPath), { recursive: true });

  if (!fs.existsSync(diskPath)) {
    const url = `${BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠ не скачано ${url} (${res.status})`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(diskPath, buf);
    console.log(`✓ ${publicSrc}`);
  }

  downloadCache.set(publicSrc, true);
  return publicSrc;
}

function parseBlocks(fragment) {
  const blocks = [];
  const firstP = fragment.search(/<p[\s>]/i);
  if (firstP > 0) {
    const lead = stripTags(fragment.slice(0, firstP));
    if (lead) blocks.push({ type: 'text', text: lead });
  }
  const re =
    /<p[^>]*>([\s\S]*?)<\/p>|<img[^>]+src=["']([^"']+)["'][^>]*>|<iframe[^>]+src=["'][^"']*youtube\.com\/embed\/([^"'?]+)[^"']*["'][^>]*>/gi;

  let m;
  while ((m = re.exec(fragment)) !== null) {
    if (m[1] !== undefined) {
      const inner = m[1];
      const imgInP = inner.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/i);
      if (imgInP) {
        blocks.push({ type: 'image', src: imgInP[1], alt: decodeHtml(imgInP[2] || '') });
        continue;
      }
      const ytInP = inner.match(/youtube\.com\/embed\/([^"'?]+)/i);
      if (ytInP) {
        const titleM = inner.match(/title=["']([^"']*)["']/i);
        blocks.push({
          type: 'youtube',
          videoId: ytInP[1],
          title: titleM ? decodeHtml(titleM[1]) : undefined,
        });
        continue;
      }
      const text = stripTags(inner);
      if (text) blocks.push({ type: 'text', text });
    } else if (m[2]) {
      const altM = m[0].match(/alt=["']([^"']*)["']/i);
      blocks.push({ type: 'image', src: m[2], alt: altM ? decodeHtml(altM[1]) : '' });
    } else if (m[3]) {
      const titleM = m[0].match(/title=["']([^"']*)["']/i);
      blocks.push({
        type: 'youtube',
        videoId: m[3],
        title: titleM ? decodeHtml(titleM[1]) : undefined,
      });
    }
  }

  // Текст без обёртки <p> (битая вёрстка на старом сайте)
  if (blocks.length === 0 && fragment.trim()) {
    const plain = stripTags(fragment);
    if (plain) blocks.push({ type: 'text', text: plain });
  }

  return blocks;
}

function extractSpoilers(html) {
  const accordionIdx = html.indexOf('<div class="su-accordion">');
  const slice = accordionIdx >= 0 ? html.slice(accordionIdx) : html;
  const parts = slice.split(/<div class="su-spoiler /);
  const spoilers = [];
  const endTag = '</motion-panel></motion-panel>'.replaceAll('motion-panel', 'div');

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const labelMatch = part.match(/su-spoiler-icon"><\/span>([^<]+)<\/h3>/);
    const contentOpen = part.match(/su-spoiler-content[^>]*>/);
    if (!labelMatch || !contentOpen) continue;
    const contentStart = part.indexOf(contentOpen[0]) + contentOpen[0].length;
    let endIdx = part.indexOf(endTag, contentStart);
    if (endIdx < 0) endIdx = part.length;
    spoilers.push({
      label: decodeHtml(labelMatch[1]),
      content: part.slice(contentStart, endIdx),
    });
  }
  return spoilers;
}

function extractIntro(html) {
  const bodyMatch = html.match(/<div itemprop="articleBody">([\s\S]*?)<div class="su-accordion">/i);
  if (!bodyMatch) return { blocks: [], paragraphs: [] };

  const introHtml = bodyMatch[1];
  const blocks = parseBlocks(introHtml);
  const paragraphs = blocks.filter((b) => b.type === 'text').map((b) => b.text);
  return { blocks, paragraphs };
}

async function resolveBlockAssets(blocks) {
  const resolved = [];
  for (const block of blocks) {
    if (block.type === 'image') {
      const src = await downloadImage(block.src);
      if (src) resolved.push({ type: 'image', src, alt: block.alt });
    } else {
      resolved.push(block);
    }
  }
  return resolved;
}

async function main() {
  if (!fs.existsSync(htmlPath)) {
    console.error(`Файл не найден: ${htmlPath}`);
    process.exit(1);
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const intro = extractIntro(html);
  const spoilers = extractSpoilers(html);

  if (spoilers.length === 0) {
    console.error('Спойлеры не найдены — проверьте HTML');
    process.exit(1);
  }

  console.log(`Найдено сезонов: ${spoilers.length}`);

  const introBlocks = await resolveBlockAssets(intro.blocks);
  const introParagraphs = introBlocks
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .filter((p) => !p.includes('| Клуб'));

  const years = [];
  for (const sp of spoilers) {
    const rawBlocks = parseBlocks(sp.content);
    const blocks = await resolveBlockAssets(rawBlocks);
    const year = yearSortKey(sp.label);
    const firstText = blocks.find((b) => b.type === 'text');
    const teaser =
      firstText && firstText.text.length > 220
        ? `${firstText.text.slice(0, 217).trim()}…`
        : firstText?.text || sp.label;

    years.push({
      label: sp.label,
      year,
      highlight: HIGHLIGHT_YEARS.has(year),
      teaser,
      blocks,
    });
  }

  years.sort((a, b) => b.year - a.year);

  const out = `/** Автогенерация: node scripts/scrape-club-history.mjs */
export type ClubHistoryBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'youtube'; videoId: string; title?: string };

export type ClubHistoryYear = {
  label: string;
  year: number;
  highlight?: boolean;
  teaser: string;
  blocks: ClubHistoryBlock[];
};

export const CLUB_HISTORY_INTRO_BLOCKS: ClubHistoryBlock[] = ${JSON.stringify(introBlocks, null, 2)};

export const CLUB_HISTORY_INTRO: string[] = ${JSON.stringify(introParagraphs, null, 2)};

export const CLUB_HISTORY_YEARS: ClubHistoryYear[] = ${JSON.stringify(years, null, 2)};
`;

  fs.writeFileSync(path.join(root, 'src/config/club-history-data.ts'), out, 'utf8');
  console.log(`\nГотово: ${years.length} сезонов, картинок: ${downloadCache.size}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
