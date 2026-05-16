// src/app/services/fields/page.tsx — Услуги полей
import type { Metadata } from 'next';
import MenuPageShell from '@/modules/shared/ui/MenuPageShell';
import {
  FIELDS_PHONE,
  FIELDS_PHONE_HREF,
  fieldsHeroImage,
  fieldsVenues,
  isFieldsGroupHeader,
} from '@/modules/shared/data/fields-services';

export const metadata: Metadata = {
  title: 'Услуги футбольных полей | Динамо-Брест',
  description:
    'Аренда футбольных полей ФК «Динамо-Брест»: ОСК «Брестский», учебно-тренировочная база, футбольная школа, манеж, стадион «Юность».',
};

export default function ServicesFieldsPage() {
  return (
    <MenuPageShell
      title="Услуги полей"
      subtitle="Услуги"
      moduleLabel="Услуги"
      imageUrl={fieldsHeroImage}
      lightContent
    >
      <div className="transport-services">
        <p className="transport-services__lead">
          Футбольный клуб «Динамо-Брест» предлагает{' '}
          <strong>услуги футбольных полей</strong> с естественным и искусственным покрытием.
        </p>

        {fieldsVenues.map((venue, index) => (
          <section
            key={venue.id}
            className="transport-services__vehicle"
            aria-labelledby={`fields-venue-${venue.id}`}
          >
            {index > 0 && <div className="transport-services__divider" />}

            <h2 id={`fields-venue-${venue.id}`} className="transport-services__vehicle-title">
              {venue.title}
            </h2>

            <div className="transport-services__venue-photo">
              <img src={venue.image} alt={venue.title} loading="lazy" />
            </div>

            <div className="transport-services__table-wrap">
              <table className="transport-services__table">
                {venue.tableCaption && (
                  <caption className="transport-services__table-caption">{venue.tableCaption}</caption>
                )}
                <thead>
                  <tr>
                    <th>№ п/п</th>
                    <th>Наименование услуг</th>
                    <th>Ед. изм.</th>
                    <th>Сумма с НДС, руб.</th>
                  </tr>
                </thead>
                <tbody>
                  {venue.rows.map((row, rowIndex) =>
                    isFieldsGroupHeader(row) ? (
                      <tr key={`${venue.id}-group-${rowIndex}`}>
                        <td colSpan={4} className="transport-services__table-group">
                          <strong>{row.groupHeader}</strong>
                        </td>
                      </tr>
                    ) : (
                      <tr key={`${venue.id}-${row.num}`}>
                        <td>{row.num}</td>
                        <td>{row.name}</td>
                        <td>{row.unit}</td>
                        <td>{row.price}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <p className="transport-services__phone transport-services__phone--footer">
          Телефон: <a href={FIELDS_PHONE_HREF}>{FIELDS_PHONE}</a>
        </p>
      </div>
    </MenuPageShell>
  );
}
