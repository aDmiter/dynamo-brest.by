// src/app/api/upload/route.ts - Загрузка изображений
import { NextRequest, NextResponse } from 'next/server';
import { access, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { optimizeUploadImage } from '@/lib/optimize-upload-image';
import { getClubHistoryDir, getImagesDir } from '@/lib/public-upload-paths';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderRaw = (formData.get('folder') as string) || 'news';
    const storage = (formData.get('storage') as string) || 'images';
    const folderSegments = folderRaw
      .split(/[/\\]+/)
      .map((s) => s.replace(/[^a-zA-Z0-9_-]/g, ''))
      .filter(Boolean);
    const folderPath = folderSegments.join('/') || 'news';

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const extFromName = (file.name.split('.').pop() || 'jpg')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    const isImageMime = file.type.startsWith('image/');
    const isImageExt = /^(jpe?g|png|gif|webp|svg|avif|heic)$/.test(extFromName);
    if (!isImageMime && !isImageExt) {
      return NextResponse.json({ error: 'Можно загружать только изображения' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);
    const { buffer, ext } = await optimizeUploadImage(inputBuffer, extFromName || 'jpg', folderPath);

    const timestamp = Date.now();
    const fileName = `upload-${timestamp}.${ext}`;

    let uploadDir: string;
    let publicUrl: string;

    if (storage === 'club-history') {
      uploadDir = getClubHistoryDir(...folderSegments);
      publicUrl = `/club-history/${folderPath}/${fileName}`;
    } else {
      uploadDir = getImagesDir(...folderSegments);
      publicUrl = `/images/${folderPath}/${fileName}`;
    }

    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    await access(filePath);

    return NextResponse.json({
      url: publicUrl,
      files: [publicUrl],
      success: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
