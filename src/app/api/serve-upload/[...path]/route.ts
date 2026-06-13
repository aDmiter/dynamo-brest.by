import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { resolveUploadedFilePath } from '@/lib/public-upload-paths';

const MIME: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  heic: 'image/heic',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (segments.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const storage = segments[0] === 'club-history' ? 'club-history' : 'images';
  const fileSegments = storage === 'club-history' ? segments.slice(1) : segments;
  const filePath = resolveUploadedFilePath(storage, fileSegments);

  if (!filePath || !existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const buffer = await readFile(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
