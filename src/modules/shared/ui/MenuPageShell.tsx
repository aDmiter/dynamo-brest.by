import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { socialLinks } from '@/modules/config/social';

interface MenuPageShellProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  moduleLabel?: string;
  lightContent?: boolean;
  children: React.ReactNode;
}

export default function MenuPageShell({
  title,
  subtitle = 'Динамо-Брест',
  imageUrl,
  moduleLabel,
  lightContent = false,
  children,
}: MenuPageShellProps) {
  const sideLabel = moduleLabel || subtitle;

  return (
    <article
      className={`menu-page${lightContent ? ' menu-page--light' : ''}`}
      style={{ fontFamily: "'Inter Tight', sans-serif" }}
    >
      <section className="menu-page__hero relative h-screen w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="menu-page__hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="menu-page__hero-overlay absolute inset-0"
          style={{ background: 'color-mix(in srgb, var(--color-bg-main) 45%, transparent)' }}
        />

        <div className="menu-page__hero-content absolute inset-0 flex items-center">
          <div className="w-full pl-6 md:pl-36 lg:pl-44">
            <p
              className="menu-page__category mb-4 text-sm font-bold uppercase tracking-[0.3em]"
              style={{ color: 'var(--color-accent)' }}
            >
              {subtitle}
            </p>
            <h1
              className="menu-page__title max-w-3xl text-4xl leading-tight text-white md:text-6xl lg:text-7xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              {title}
            </h1>
          </div>
        </div>

        <div className="menu-page__social absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-6 md:flex">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="transition-colors"
              style={{ color: 'var(--color-text-stat)' }}
            >
              <FontAwesomeIcon icon={social.icon} className="text-lg" />
            </a>
          ))}
          <div className="h-12 w-px" style={{ background: 'var(--color-border-light)' }} />
        </div>

        <div className="menu-page__scroll absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div
            className="flex flex-col items-center gap-2"
            style={{ color: 'var(--color-text-stat)' }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em]">Читать</span>
            <div className="h-12 w-px" style={{ background: 'var(--color-border-light)' }} />
          </div>
        </div>
      </section>

      <section
        className="menu-page__content relative overflow-x-hidden"
        style={{ background: lightContent ? '#ffffff' : 'var(--color-bg-main)' }}
      >
        <div className="container mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:ml-20 lg:ml-24">
          {children}
        </div>

        <div className="menu-page__title-module absolute right-0 bottom-0 pointer-events-none select-none">
          <span
            className="block text-[60px] font-black uppercase tracking-[0.1em] md:text-[80px] leading-none"
            style={{
              writingMode: 'vertical-lr',
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
              color: 'color-mix(in srgb, var(--color-team-names) 15%, transparent)',
            }}
          >
            {sideLabel}
          </span>
        </div>
      </section>
    </article>
  );
}
