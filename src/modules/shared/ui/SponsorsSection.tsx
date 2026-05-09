// src/modules/shared/ui/SponsorsSection.tsx - Секция спонсоров
import { prisma } from '@/lib/prisma';
import SponsorLogo from './SponsorLogo';

export default async function SponsorsSection() {
  const sponsors = await prisma.sponsor.findMany({
    where: { isActive: true },
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
  });

  if (sponsors.length === 0) return null;

  const leagueSponsor = sponsors.find((s) => s.type === 'league');
  const generalSponsors = sponsors.filter((s) => s.type === 'general');
  const governmentSponsors = sponsors.filter((s) => s.type === 'government');

  return (
    <section className="sponsors border-t border-white/5 bg-[#0B0F1C]">
      <div className="sponsors__container mx-auto max-w-[1200px] px-4 py-14 md:px-8">
        {/* Спонсор лиги — первый ряд, по центру */}
        {leagueSponsor && (
          <div className="sponsors__league mb-12 flex justify-center">
            <SponsorLogo
              imageUrl={leagueSponsor.imageUrl}
              name={leagueSponsor.name}
              linkUrl={leagueSponsor.linkUrl}
              className="md:max-h-24"
            />
          </div>
        )}

        {/* Общие спонсоры — сетка по центру */}
        {generalSponsors.length > 0 && (
          <div className="sponsors__general mb-12">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              {generalSponsors.map((sponsor) => (
                <SponsorLogo
                  key={sponsor.id}
                  imageUrl={sponsor.imageUrl}
                  name={sponsor.name}
                  linkUrl={sponsor.linkUrl}
                />
              ))}
            </div>
          </div>
        )}

        {/* Государственные спонсоры — отдельный ряд */}
        {governmentSponsors.length > 0 && (
          <div className="sponsors__government">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              {governmentSponsors.map((sponsor) => (
                <SponsorLogo
                  key={sponsor.id}
                  imageUrl={sponsor.imageUrl}
                  name={sponsor.name}
                  linkUrl={sponsor.linkUrl}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
