// src/modules/shared/ui/ScrollSnapWrapper.tsx - Обёртка для автоматического скролла
'use client';

import { useScrollSnap } from '@/modules/shared/hooks/useScrollSnap';

export default function ScrollSnapWrapper({ children }: { children: React.ReactNode }) {
  useScrollSnap();
  return <>{children}</>;
}
