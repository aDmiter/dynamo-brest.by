import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSection } from '@/lib/admin-api-auth';
import {
  loadBeFieldsForResource,
  type ContentResourceType,
} from '@/lib/content-translations';

function isResourceType(value: string): value is ContentResourceType {
  return (
    value === 'news' ||
    value === 'menuitem' ||
    value === 'footermenuitem' ||
    value === 'product'
  );
}

export async function GET(request: NextRequest) {
  const resourceType = request.nextUrl.searchParams.get('resourceType') ?? '';
  const resourceId = request.nextUrl.searchParams.get('resourceId') ?? '';

  if (!isResourceType(resourceType) || !resourceId) {
    return NextResponse.json({ error: 'Некорректные параметры' }, { status: 400 });
  }

  let auth = await requireAdminSection('translations');
  if (auth instanceof NextResponse) {
    if (resourceType === 'news') {
      auth = await requireAdminSection('news');
    } else if (resourceType === 'product') {
      auth = await requireAdminSection('shop');
    } else {
      auth = await requireAdminSection('settings');
    }
    if (auth instanceof NextResponse) return auth;
  }

  const fields = await loadBeFieldsForResource(resourceType, resourceId);
  return NextResponse.json({ fields });
}
