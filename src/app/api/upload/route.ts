// src/app/api/upload/route.ts - Загрузка изображений
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    const extFromName = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
    const isImageMime = file.type.startsWith('image/');
    const isImageExt = /^(jpe?g|png|gif|webp|svg|avif|heic)$/i.test(extFromName);
    if (!isImageMime && !isImageExt) {
      return NextResponse.json({ error: 'Можно загружать только изображения' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const ext = extFromName || 'jpg';
    const fileName = `upload-${timestamp}.${ext}`;

    let uploadDir: string;
    let publicUrl: string;

    if (storage === 'club-history') {
      uploadDir = path.join(process.cwd(), 'public', 'club-history', ...folderSegments);
      publicUrl = `/club-history/${folderPath}/${fileName}`;
    } else {
      uploadDir = path.join(process.cwd(), 'public', 'images', ...folderSegments);
      publicUrl = `/images/${folderPath}/${fileName}`;
    }

    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

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
