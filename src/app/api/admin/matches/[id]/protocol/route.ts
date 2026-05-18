import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getAdminMatchProtocol,
  saveAdminMatchProtocol,
  type SaveAdminProtocolInput,
} from '@/lib/match-protocol-admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  return session;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  const protocol = await getAdminMatchProtocol(id);
  if (!protocol) {
    return NextResponse.json({ error: 'Матч не найден' }, { status: 404 });
  }

  return NextResponse.json(protocol);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  let body: SaveAdminProtocolInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.lineups) || !Array.isArray(body.goals)) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }

  try {
    const result = await saveAdminMatchProtocol(id, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    const protocol = await getAdminMatchProtocol(id);
    return NextResponse.json(protocol);
  } catch (error) {
    console.error('PUT /api/admin/matches/[id]/protocol:', error);
    const message =
      error instanceof Error ? error.message : 'Ошибка сохранения протокола';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
