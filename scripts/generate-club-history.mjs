/**
 * Одноразовая генерация src/config/club-history-data.ts из markdown-дампа старого сайта.
 * Запуск: node scripts/generate-club-history.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sourcePath =
  process.argv[2] ||
  path.join(
    process.env.USERPROFILE || '',
    '.cursor/projects/d-Project-dynamo-brest/agent-tools/219508b9-b387-42bc-b1b3-c9a29c80fbab.txt',
  );

const raw = fs.readFileSync(sourcePath, 'utf8');
const lines = raw.split(/\r?\n/);

const introEnd = lines.findIndex((l) => l.startsWith('### '));
const introParagraphs = lines
  .slice(0, introEnd)
  .join('\n')
  .split(/\n\n+/)
  .map((p) => p.trim())
  .filter(Boolean);

const HIGHLIGHT_YEARS = new Set([1960, 2007, 2017, 2018, 2019, 2020, 2021]);

function parseYearLabel(header) {
  const m = header.match(/^###\s+(.+)$/);
  return m ? m[1].trim() : header;
}

function yearSortKey(label) {
  const nums = label.match(/\d{4}/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}

const sections = [];
let current = null;

for (let i = introEnd; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('### ')) {
    if (current) sections.push(current);
    current = { label: parseYearLabel(line), paragraphs: [] };
    continue;
  }
  if (!current) continue;
  const t = line.trim();
  if (t) current.paragraphs.push(t);
  else if (current.paragraphs.length && current.paragraphs[current.paragraphs.length - 1] !== '') {
    current.paragraphs.push('');
  }
}

if (current) sections.push(current);

for (const s of sections) {
  s.paragraphs = s.paragraphs
    .join('\n')
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);
  const key = yearSortKey(s.label);
  s.year = key;
  s.highlight = HIGHLIGHT_YEARS.has(key);
  const first = s.paragraphs[0] || '';
  s.teaser =
    first.length > 220 ? `${first.slice(0, 217).trim()}…` : first;
}

sections.sort((a, b) => b.year - a.year);

const out = `/** Автогенерация: node scripts/generate-club-history.mjs — не править вручную массив years */
export type ClubHistoryYear = {
  label: string;
  year: number;
  highlight?: boolean;
  teaser: string;
  paragraphs: string[];
};

export const CLUB_HISTORY_INTRO: string[] = ${JSON.stringify(introParagraphs, null, 2)};

export const CLUB_HISTORY_YEARS: ClubHistoryYear[] = ${JSON.stringify(sections, null, 2)};
`;

const outPath = path.join(root, 'src/config/club-history-data.ts');
fs.writeFileSync(outPath, out, 'utf8');
console.log(`Wrote ${sections.length} years to ${outPath}`);
