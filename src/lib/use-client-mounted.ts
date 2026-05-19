'use client';

import { useEffect, useState } from 'react';

/** true после монтирования — для Swiper/таймеров без hydration mismatch */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
