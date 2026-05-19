import type { Metadata } from 'next';
import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { CodedCmsPageView } from '@/lib/coded-cms-page';

const SLUG = 'club-stadium';

export const metadata: Metadata = CODED_CMS_PAGES[SLUG].metadata;

export default function ClubStadiumPage() {
  return <CodedCmsPageView slug={SLUG} />;
}
