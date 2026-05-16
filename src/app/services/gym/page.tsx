// src/app/services/gym/page.tsx — Тренажёрный зал
import type { Metadata } from 'next';
import MenuPageShell from '@/modules/shared/ui/MenuPageShell';
import TransportPhotoGallery from '@/modules/shared/ui/TransportPhotoGallery';
import {
  GYM_PHONE,
  GYM_PHONE_HREF,
  gymGalleryImages,
  gymHeroImage,
  gymPrices,
  gymSchedule,
} from '@/modules/shared/data/gym-services';

export const metadata: Metadata = {
  title: 'Тренажёрный зал в центре Бреста | Динамо-Брест',
  description:
    'Тренажёрный зал ФК «Динамо-Брест» на стадионе «Брестский»: режим работы, цены, абонементы. ул. Гоголя, 9.',
};

export default function ServicesGymPage() {
  return (
    <MenuPageShell
      title="Тренажёрный зал в центре Бреста"
      subtitle="Услуги"
      moduleLabel="Услуги"
      imageUrl={gymHeroImage}
      lightContent
    >
      <div className="transport-services">
        <aside className="transport-services__schedule">
          <p className="transport-services__schedule-title">{gymSchedule.title}</p>
          <ul className="transport-services__schedule-list">
            {gymSchedule.rows.map((row) => (
              <li key={row.label}>
                <span>{row.label}:</span> {row.value}
              </li>
            ))}
          </ul>
        </aside>

        <TransportPhotoGallery images={gymGalleryImages} />

        <p className="transport-services__lead transport-services__lead--after-gallery">
          Футбольный клуб «Динамо-Брест» предлагает посетить тренажёрный зал на стадионе «Брестский»
          по адресу: <strong>ул. Гоголя, 9</strong>.
        </p>

        <section className="transport-services__vehicle" aria-labelledby="gym-prices-title">
          <h2 id="gym-prices-title" className="transport-services__vehicle-title">
            Стоимость услуг
          </h2>

          <div className="transport-services__table-wrap">
            <table className="transport-services__table">
              <thead>
                <tr>
                  <th>№ п/п</th>
                  <th>Наименование услуг</th>
                  <th>Ед. изм.</th>
                  <th>Сумма, руб.</th>
                </tr>
              </thead>
              <tbody>
                {gymPrices.map((row) => (
                  <tr key={row.num}>
                    <td>{row.num}</td>
                    <td>{row.name}</td>
                    <td>{row.unit}</td>
                    <td>{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="transport-services__phone transport-services__phone--footer">
          Телефон: <a href={GYM_PHONE_HREF}>{GYM_PHONE}</a>
        </p>
      </div>
    </MenuPageShell>
  );
}
