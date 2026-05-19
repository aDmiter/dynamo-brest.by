import type { Metadata } from 'next';
import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { CodedCmsPageView } from '@/lib/coded-cms-page';

const SLUG = 'services-transport';

export const metadata: Metadata = CODED_CMS_PAGES[SLUG].metadata;

export default function ServicesTransportPage() {
  return <CodedCmsPageView slug={SLUG} />;
}
