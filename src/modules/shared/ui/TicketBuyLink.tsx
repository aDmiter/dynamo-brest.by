'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { getTicketLinkProps } from '@/lib/ticket-widget';
import { useTicketSaleframeModal } from '@/modules/shared/ui/TicketSaleframeModalContext';

type TicketBuyLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export default function TicketBuyLink({ href, children, target, rel, ...props }: TicketBuyLinkProps) {
  const saleframeModalAllowed = useTicketSaleframeModal();
  const widgetProps = getTicketLinkProps(href, saleframeModalAllowed);

  return (
    <a
      href={href}
      {...props}
      target={target ?? widgetProps.target}
      rel={rel ?? widgetProps.rel}
    >
      {children}
    </a>
  );
}
