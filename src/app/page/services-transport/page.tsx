// src/app/page/services-transport/page.tsx — Услуги транспорта
import type { Metadata } from 'next';
import MenuPageShell from '@/modules/shared/ui/MenuPageShell';
import TransportPhotoGallery from '@/modules/shared/ui/TransportPhotoGallery';
import {
  TRANSPORT_PHONE,
  TRANSPORT_PHONE_HREF,
  transportHeroImage,
  transportVehicles,
} from '@/modules/shared/data/transport-services';

export const metadata: Metadata = {
  title: 'Транспортные услуги в Бресте | Динамо-Брест',
  description:
    'ФК «Динамо-Брест» предлагает услуги автобусов с водителем для пассажирских перевозок по РБ, странам СНГ, Прибалтики и Европы.',
};

export default function ServicesTransportPage() {
  return (
    <MenuPageShell
      title="Транспортные услуги в Бресте"
      subtitle="Услуги"
      moduleLabel="Услуги"
      imageUrl={transportHeroImage}
      lightContent
    >
      <div className="transport-services">
        <p className="transport-services__lead">
          Футбольный клуб «Динамо-Брест» предлагает <strong>услуги автобусов</strong> с водителем
          для осуществления <em>пассажирских перевозок</em> по РБ, странам СНГ, Прибалтики и
          Европы.
        </p>

        {transportVehicles.map((vehicle, index) => (
          <section
            key={vehicle.id}
            className="transport-services__vehicle"
            aria-labelledby={`vehicle-${vehicle.id}`}
          >
            {index > 0 && <div className="transport-services__divider" />}

            <h2 id={`vehicle-${vehicle.id}`} className="transport-services__vehicle-title">
              {vehicle.title}
            </h2>

            <p className="transport-services__vehicle-desc">{vehicle.description}</p>

            <p className="transport-services__phone">
              Информация по ценам на перевозку {vehicle.contactName} и маршрутам по телефону:{' '}
              <a href={TRANSPORT_PHONE_HREF}>{TRANSPORT_PHONE}</a>
            </p>

            <TransportPhotoGallery images={vehicle.images} />
          </section>
        ))}
      </div>
    </MenuPageShell>
  );
}
