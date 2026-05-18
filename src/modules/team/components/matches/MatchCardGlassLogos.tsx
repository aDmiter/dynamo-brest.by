import Image from 'next/image';

interface Props {
  homeName: string;
  awayName: string;
  homeLogo: string | null;
  awayLogo: string | null;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function GlassLogo({
  name,
  logoUrl,
  side,
}: {
  name: string;
  logoUrl: string | null;
  side: 'home' | 'away';
}) {
  return (
    <div className={`team-matches-v1__glass-logo team-matches-v1__glass-logo--${side}`}>
      {logoUrl ? (
        <Image src={logoUrl} alt="" width={640} height={560} className="object-contain" />
      ) : (
        <span className="team-matches-v1__glass-initials">{initials(name)}</span>
      )}
    </div>
  );
}

export default function MatchCardGlassLogos({ homeName, awayName, homeLogo, awayLogo }: Props) {
  return (
    <div className="team-matches-v1__glass" aria-hidden>
      <GlassLogo name={homeName} logoUrl={homeLogo} side="home" />
      <GlassLogo name={awayName} logoUrl={awayLogo} side="away" />
    </div>
  );
}
