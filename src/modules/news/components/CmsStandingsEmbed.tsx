'use client';

import StandingsTable from '@/modules/team/components/StandingsTable';

interface Props {
  cometId: string;
}

export default function CmsStandingsEmbed({ cometId }: Props) {
  return (
    <div className="cms-standings-embed__mount">
      <StandingsTable cometId={cometId} />
    </div>
  );
}
