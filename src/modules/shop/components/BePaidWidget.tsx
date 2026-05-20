'use client';

import Script from 'next/script';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { BEPAID_CHECKOUT_URL, BEPAID_WIDGET_SCRIPT } from '@/config/bepaid-public';
import { isBePaidMockToken } from '@/config/bepaid-public';
import { BePaidTestPaymentModal } from '@/modules/shop/components/BePaidTestPaymentModal';
import type { BePaidWidgetCloseStatus } from '@/types/bepaid-widget';

export type BePaidWidgetHandle = {
  open: (token: string, meta?: { orderNumber: string; total: number }) => void;
};

type Props = {
  onClose: (status: BePaidWidgetCloseStatus) => void;
};

export const BePaidWidget = forwardRef<BePaidWidgetHandle, Props>(function BePaidWidget(
  { onClose },
  ref
) {
  const [scriptReady, setScriptReady] = useState(false);
  const [mockSession, setMockSession] = useState<{
    token: string;
    orderNumber: string;
    total: number;
  } | null>(null);

  const openRealWidget = useCallback(
    (token: string) => {
      if (!scriptReady || typeof window.BeGateway === 'undefined') {
        console.error('bePaid widget script не загружен');
        onClose('error');
        return;
      }

      new window.BeGateway({
        checkout_url: BEPAID_CHECKOUT_URL,
        fromWebview: true,
        token,
        checkout: { iframe: true },
        closeWidget: onClose,
      }).createWidget();
    },
    [scriptReady, onClose]
  );

  const open = useCallback(
    (token: string, meta?: { orderNumber: string; total: number }) => {
      if (isBePaidMockToken(token)) {
        if (!meta?.orderNumber || meta.total === undefined) {
          onClose('error');
          return;
        }
        setMockSession({ token, orderNumber: meta.orderNumber, total: meta.total });
        return;
      }
      openRealWidget(token);
    },
    [openRealWidget, onClose]
  );

  useImperativeHandle(ref, () => ({ open }), [open]);

  const handleMockClose = (status: BePaidWidgetCloseStatus) => {
    setMockSession(null);
    onClose(status);
  };

  return (
    <>
      {mockSession && (
        <BePaidTestPaymentModal
          orderNumber={mockSession.orderNumber}
          total={mockSession.total}
          token={mockSession.token}
          onClose={handleMockClose}
        />
      )}
      <Script
        src={BEPAID_WIDGET_SCRIPT}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
    </>
  );
});
