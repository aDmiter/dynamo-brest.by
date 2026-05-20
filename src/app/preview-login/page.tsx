import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSitePreviewStatus } from '@/lib/site-preview';
import PreviewLoginForm from './PreviewLoginForm';

export const dynamic = 'force-dynamic';

export default async function PreviewLoginPage() {
  const { enabled, message } = await getSitePreviewStatus();
  if (!enabled) {
    redirect('/');
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D1225]" />}>
      <PreviewLoginForm message={message} />
    </Suspense>
  );
}
