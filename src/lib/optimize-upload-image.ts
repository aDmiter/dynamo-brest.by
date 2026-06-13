import sharp from 'sharp';

const FOLDER_MAX_WIDTH: Record<string, number> = {
  logos: 512,
  'partners/sponsors': 600,
  headers: 1920,
  news: 1920,
  featured: 1920,
  cms: 1600,
  products: 1600,
  coaches: 1400,
  players: 1400,
  admin: 1920,
};

const WEBP_QUALITY = 82;

function getMaxWidthForFolder(folder: string): number {
  if (FOLDER_MAX_WIDTH[folder]) return FOLDER_MAX_WIDTH[folder];
  const parent = folder.split('/')[0];
  return FOLDER_MAX_WIDTH[parent] ?? 1920;
}

/** SVG и GIF не конвертируем (вектор / анимация). */
function shouldConvertToWebp(ext: string): boolean {
  return ext !== 'svg' && ext !== 'gif';
}

export async function optimizeUploadImage(
  input: Buffer,
  ext: string,
  folderPath: string
): Promise<{ buffer: Buffer; ext: string }> {
  if (!shouldConvertToWebp(ext)) {
    return { buffer: input, ext };
  }

  try {
    const maxWidth = getMaxWidthForFolder(folderPath);
    const buffer = await sharp(input)
      .rotate()
      .resize(maxWidth, undefined, { withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();
    return { buffer, ext: 'webp' };
  } catch {
    return { buffer: input, ext };
  }
}
