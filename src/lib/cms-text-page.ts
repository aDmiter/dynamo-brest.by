/** CMSTextPage — подзаголовок над h1 и водяной знак в компактном hero */
export function resolveCmsTextPageHeader(
  subtitle: string | null | undefined,
  watermarkFallback = 'Динамо-Брест',
) {
  const tag = subtitle?.trim() || 'Динамо-Брест';
  const watermark = subtitle?.trim() || watermarkFallback;
  return { line: tag, watermark };
}
