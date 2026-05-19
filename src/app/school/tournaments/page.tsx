import type { Metadata } from 'next';
import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { CodedCmsPageView } from '@/lib/coded-cms-page';

const SLUG = 'school-tournaments';

export const metadata: Metadata = CODED_CMS_PAGES[SLUG].metadata;

export default function SchoolTournamentsPage() {
  return <CodedCmsPageView slug={SLUG} />;
}
