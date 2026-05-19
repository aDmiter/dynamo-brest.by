import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { syncSitePageRegistry } from '@/lib/site-pages-registry';
import SitePageMetaAdmin from '@/modules/admin/components/SitePageMetaAdmin';

export const metadata: Metadata = {
  title: 'SEO и Meta | Админ-панель',
};

export const dynamic = 'force-dynamic';

export default async function SiteSeoAdminPage() {
  const count = await prisma.sitePageMeta.count();
  if (count === 0) {
    await syncSitePageRegistry();
  }

  const pages = await prisma.sitePageMeta.findMany({
    orderBy: [{ source: 'asc' }, { path: 'asc' }],
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-2">SEO и Meta страниц</h1>
      <p className="text-sm text-gray-400 mb-8">
        Управление title, description, редиректами и статистикой посещений публичных страниц.
      </p>
      <SitePageMetaAdmin initialPages={pages} />
    </div>
  );
}
