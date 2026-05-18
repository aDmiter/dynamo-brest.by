import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMatchProtocol } from '@/lib/match-protocol';
import { buildOpponentTeamMap } from '@/modules/team/lib/resolve-match-teams';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const opponentTeams = await prisma.opponentTeam.findMany({
      where: { isActive: true },
      select: { cometId: true, name: true, logoUrl: true },
    });
    const opponentMap = buildOpponentTeamMap(opponentTeams);

    const protocol = await getMatchProtocol(id, opponentMap);
    if (!protocol) {
      return NextResponse.json({ error: 'Матч не найден' }, { status: 404 });
    }

    return NextResponse.json({ success: true, protocol });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка загрузки протокола' },
      { status: 500 }
    );
  }
}
