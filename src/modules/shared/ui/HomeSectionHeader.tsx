import Link from 'next/link';

interface Props {
  title: string;
  linkHref: string;
  linkLabel: string;
  titleId?: string;
  watermark?: string;
  variant?: 'light' | 'dark';
  external?: boolean;
}

export default function HomeSectionHeader({
  title,
  linkHref,
  linkLabel,
  titleId,
  watermark = title,
  variant = 'light',
  external = false,
}: Props) {
  const linkText = `${linkLabel} →`;

  return (
    <header className={`home-section-header home-section-header--${variant}`}>
      <div className="home-section-header__watermark" aria-hidden>
        {watermark}
      </div>
      <div className="home-section-header__row">
        <div className="home-section-header__main">
          <div className="home-section-header__accent" aria-hidden />
          <h2 id={titleId} className="home-section-header__title-text">
            {title}
          </h2>
        </div>
        <div className="home-section-header__line" aria-hidden />
        {external ? (
          <a
            href={linkHref}
            className="home-section-header__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkText}
          </a>
        ) : (
          <Link href={linkHref} className="home-section-header__link">
            {linkText}
          </Link>
        )}
      </div>
    </header>
  );
}
