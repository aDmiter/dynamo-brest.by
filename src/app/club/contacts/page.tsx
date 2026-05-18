import type { Metadata } from 'next';
import ClubContactsView from '@/modules/club/components/ClubContactsView';

export const metadata: Metadata = {
  title: 'Контакты | Динамо-Брест',
  description:
    'Контакты ФК «Динамо-Брест»: адрес, телефоны, e-mail и руководство клуба и СДЮШОР олимпийского резерва.',
};

export default function ClubContactsPage() {
  return <ClubContactsView />;
}
