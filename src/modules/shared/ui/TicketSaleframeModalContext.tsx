'use client';

import { createContext, useContext, type ReactNode } from 'react';

const TicketSaleframeModalContext = createContext(true);

export function TicketSaleframeModalProvider({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}) {
  return (
    <TicketSaleframeModalContext.Provider value={value}>
      {children}
    </TicketSaleframeModalContext.Provider>
  );
}

export function useTicketSaleframeModal(): boolean {
  return useContext(TicketSaleframeModalContext);
}
