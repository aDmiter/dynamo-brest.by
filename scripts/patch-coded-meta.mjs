import fs from 'fs';

const files = [
  'src/app/club/contacts/page.tsx',
  'src/app/club/partners/page.tsx',
  'src/app/club/stadium/page.tsx',
  'src/app/fans/page.tsx',
  'src/app/media/anthems/page.tsx',
  'src/app/media/press/page.tsx',
  'src/app/school/about/page.tsx',
  'src/app/school/join/page.tsx',
  'src/app/school/teams/page.tsx',
  'src/app/school/tournaments/page.tsx',
  'src/app/services/cafe/page.tsx',
  'src/app/services/fields/page.tsx',
  'src/app/services/gym/page.tsx',
  'src/app/services/hotel/page.tsx',
  'src/app/shop/delivery/page.tsx',
  'src/app/shop/payment/page.tsx',
  'src/app/shop/returns/page.tsx',
];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('CODED_CMS_PAGES[SLUG].metadata')) continue;
  c = c.replace(/import type \{ Metadata \} from 'next';\r?\n/, '');
  if (!c.includes('createCodedPageMetadata')) {
    c = c.replace(
      "import { CODED_CMS_PAGES }",
      "import { createCodedPageMetadata } from '@/lib/site-page-meta';\nimport { CODED_CMS_PAGES }"
    );
  }
  c = c.replace(
    /export const metadata: Metadata = CODED_CMS_PAGES\[SLUG\]\.metadata;/,
    'export const generateMetadata = createCodedPageMetadata(SLUG);'
  );
  fs.writeFileSync(f, c);
  console.log('updated', f);
}
