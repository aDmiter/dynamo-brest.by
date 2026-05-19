import { createCodedPageMetadata } from '@/lib/site-page-meta';
import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { CodedCmsPageView } from '@/lib/coded-cms-page';

const SLUG = 'club-contacts';

export const generateMetadata = createCodedPageMetadata(SLUG);

export default function ClubContactsPage() {
  return <CodedCmsPageView slug={SLUG} />;
}
