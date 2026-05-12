// src/app/api/facilities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const cometId = parseInt(id);

  if (isNaN(cometId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const facility = await prisma.facility.findUnique({
    where: { cometId },
  });

  if (!facility) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(facility);
}
