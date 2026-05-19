// Паттерн «CMSTextPage» — единая вёрстка CMS-страниц (компактный hero или Hero header)
import CompactPageHero from '@/modules/shared/ui/CompactPageHero';
import MenuPageShell from '@/modules/shared/ui/MenuPageShell';
import CmsHtmlContent from '@/modules/shared/ui/CmsHtmlContent';
import { resolveCmsTextPageHeader } from '@/lib/cms-text-page';

export interface CmsTextPageProps {
  title: string;
  subtitle?: string | null;
  pageContent?: string | null;
  heroHeader?: boolean;
  imageUrl?: string | null;
  lightContent?: boolean;
  /** Водяной знак, если подзаголовок не задан (для /legal — «legal») */
  watermarkFallback?: string;
  children?: React.ReactNode;
}

export default function CmsTextPage({
  title,
  subtitle,
  pageContent,
  heroHeader = false,
  imageUrl,
  lightContent = false,
  watermarkFallback,
  children,
}: CmsTextPageProps) {
  const { line, watermark } = resolveCmsTextPageHeader(subtitle, watermarkFallback);

  if (heroHeader) {
    return (
      <MenuPageShell
        title={title}
        subtitle={line}
        moduleLabel={line}
        imageUrl={imageUrl || '/images/placeholder.jpg'}
        lightContent={lightContent}
      >
        {children ??
          (pageContent ? (
            <CmsHtmlContent
              className="legal-page__body prose max-w-none prose-headings:font-heading prose-headings:text-[#242C41] prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#ee862c] prose-img:max-w-full"
              html={pageContent}
            />
          ) : (
            <p className="legal-page__empty">Содержимое страницы в разработке</p>
          ))}
      </MenuPageShell>
    );
  }

  return (
    <article className="legal-page">
      <div className="legal-page__header">
        <CompactPageHero subtitle={line} title={title} watermark={watermark} />
      </div>

      <section className="legal-page__content">
        <div className="legal-page__container">
          {children ??
            (pageContent ? (
              <CmsHtmlContent className="legal-page__body prose max-w-none" html={pageContent} />
            ) : (
              <p className="legal-page__empty">Содержимое страницы в разработке</p>
            ))}
        </div>
      </section>
    </article>
  );
}
