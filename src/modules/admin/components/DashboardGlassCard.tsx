import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export interface DashboardStatItem {
  label: string;
  value: React.ReactNode;
  hint?: string;
  href: string;
}

interface DashboardGlassCardProps {
  title: string;
  description?: string;
  icon: IconDefinition;
  stats: DashboardStatItem[];
  primaryHref: string;
  primaryLabel: string;
  featured?: boolean;
}

export default function DashboardGlassCard({
  title,
  description,
  icon,
  stats,
  primaryHref,
  primaryLabel,
  featured = false,
}: DashboardGlassCardProps) {
  return (
    <article
      className={`group relative flex flex-col border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.07] ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#ee862c]/10 blur-2xl"
        aria-hidden
      />

      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div>
          <h2
            className="font-heading text-lg font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
          >
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#ee862c]/25 bg-[#ee862c]/10 text-[#ee862c]">
          <FontAwesomeIcon icon={icon} className="text-lg" />
        </div>
      </div>

      <div
        className={`relative grid flex-1 gap-4 ${
          featured ? 'sm:grid-cols-3' : stats.length > 2 ? 'sm:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {stats.map((stat) => (
          <Link
            key={stat.href + stat.label}
            href={stat.href}
            className="block border border-white/10 bg-black/20 p-4 transition-colors hover:border-[#ee862c]/40 hover:bg-black/30"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-white tabular-nums">{stat.value}</p>
            {stat.hint && <p className="mt-1 text-xs text-gray-500">{stat.hint}</p>}
          </Link>
        ))}
      </div>

      <Link
        href={primaryHref}
        className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#ee862c] transition-colors group-hover:text-[#f0ac74]"
      >
        {primaryLabel}
        <FontAwesomeIcon
          icon={faArrowRight}
          className="text-xs transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </article>
  );
}
