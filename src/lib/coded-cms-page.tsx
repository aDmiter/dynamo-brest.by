import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import CmsTextPage from '@/modules/shared/ui/CmsTextPage';

export async function CodedCmsPageView({ slug }: { slug: string }) {
  const config = CODED_CMS_PAGES[slug];
  const page = await prisma.menuitem.findUnique({ where: { slug } });

  if (!page || !page.isActive || page.type !== 'page') {
    notFound();
  }

  return (
    <CmsTextPage
      title={page.title}
      subtitle={page.subtitle ?? config?.defaultSubtitle ?? 'Динамо-Брест'}
      pageContent={page.pageContent}
      heroHeader={page.heroHeader}
      imageUrl={page.imageUrl}
      lightContent={config?.lightContent}
      watermarkFallback={config?.watermark ?? 'Динамо-Брест'}
    />
  );
}
