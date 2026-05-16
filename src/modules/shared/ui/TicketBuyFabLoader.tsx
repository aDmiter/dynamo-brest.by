// src/modules/shared/ui/TicketBuyFabLoader.tsx
import { getNextMainTicketMatch } from '@/lib/get-next-ticket-match';
import TicketBuyFab from './TicketBuyFab';

export default async function TicketBuyFabLoader() {
  const match = await getNextMainTicketMatch();
  if (!match) return null;
  return <TicketBuyFab match={match} />;
}
