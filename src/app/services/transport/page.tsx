import { CODED_CMS_PAGES } from '@/config/coded-cms-pages';
import { CodedCmsPageView } from '@/lib/coded-cms-page';
import { createCodedPageMetadata } from '@/lib/site-page-meta';

const SLUG = 'services-transport';

export const generateMetadata = createCodedPageMetadata(SLUG);

export default function ServicesTransportPage() {
  return <CodedCmsPageView slug={SLUG} />;
}
