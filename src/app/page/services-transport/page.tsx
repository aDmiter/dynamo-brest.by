import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Транспортные услуги в Бресте | Динамо-Брест',
};

export default function ServicesTransportRedirectPage() {
  redirect('/services/transport');
}
