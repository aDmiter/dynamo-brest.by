import { existsSync } from 'fs';
import path from 'path';

export function getPublicDir(): string {
  const envRoot = process.env.PUBLIC_ROOT?.trim();
  if (envRoot) return path.resolve(envRoot);

  const cwd = process.cwd();
  const direct = path.join(cwd, 'public');
  if (existsSync(direct)) return direct;

  const sibling = path.join(cwd, '..', 'public');
  if (existsSync(sibling)) return path.resolve(sibling);

  return direct;
}

export function getImagesDir(...segments: string[]): string {
  const safe = segments.map((s) => s.replace(/[^a-zA-Z0-9_-]/g, '')).filter(Boolean);
  return path.join(getPublicDir(), 'images', ...safe);
}

export function getClubHistoryDir(...segments: string[]): string {
  const safe = segments.map((s) => s.replace(/[^a-zA-Z0-9_-]/g, '')).filter(Boolean);
  return path.join(getPublicDir(), 'club-history', ...safe);
}

export function resolveUploadedFilePath(
  storage: 'images' | 'club-history',
  segments: string[]
): string | null {
  const safe = segments.map((s) => s.replace(/[^a-zA-Z0-9._-]/g, '')).filter(Boolean);
  if (safe.length === 0 || safe.some((s) => !s)) return null;

  const root =
    storage === 'club-history'
      ? path.resolve(getPublicDir(), 'club-history')
      : path.resolve(getPublicDir(), 'images');
  const resolved = path.resolve(root, ...safe);

  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return resolved;
}
