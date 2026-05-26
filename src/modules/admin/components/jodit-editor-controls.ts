import type { CmsGalleryImage } from '@/lib/cms-gallery';
import { createJoditGalleryButton } from '@/modules/admin/components/jodit-gallery-button';
import { createJoditYoutubeControl } from '@/modules/admin/components/jodit-youtube-button';

export function buildJoditCmsControls(
  buildGalleryHtml: (images: CmsGalleryImage[]) => string,
  createSpoilerControl: () => Record<string, unknown>
) {
  return {
    cmsGallery: createJoditGalleryButton(buildGalleryHtml),
    cmsYoutube: createJoditYoutubeControl(),
    spoiler: createSpoilerControl(),
  };
}
