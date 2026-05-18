import { CLUB_CONTACT_SECTIONS } from '@/config/club-contacts';

function ContactStaffTable({
  rows,
}: {
  rows: (typeof CLUB_CONTACT_SECTIONS)[0]['staff'];
}) {
  return (
    <div className="club-contacts__table-wrap">
      <table className="club-contacts__table">
        <thead>
          <tr>
            <th>Должность</th>
            <th>Ф. И. О.</th>
            <th>Номер телефона</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.position}-${row.name}`}>
              <td>{row.position}</td>
              <td>{row.name}</td>
              <td>
                <a href={row.phoneHref} className="club-contacts__phone-link">
                  {row.phone}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ClubContactsView() {
  return (
    <div className="club-contacts">
      <div className="club-contacts__glow club-contacts__glow--accent" aria-hidden />
      <div className="club-contacts__glow club-contacts__glow--primary" aria-hidden />

      <header className="club-contacts__hero">
        <div className="club-contacts__hero-inner">
          <p className="club-contacts__eyebrow">Клуб</p>
          <h1 className="club-contacts__title">Контакты</h1>
          <p className="club-contacts__lead">
            Реквизиты, телефоны и сотрудники администрации ФК «Динамо-Брест» и СДЮШОР
          </p>
        </div>
      </header>

      <div className="club-contacts__body">
        {CLUB_CONTACT_SECTIONS.map((section) => (
          <section
            key={section.id}
            className="club-contacts__section club-contacts-glass"
            aria-labelledby={`club-contacts-${section.id}-title`}
          >
            <h2 id={`club-contacts-${section.id}-title`} className="club-contacts__section-title">
              {section.title}
            </h2>
            <p className="club-contacts__legal">{section.legalName}</p>

            <div className="club-contacts__meta">
              <div className="club-contacts__meta-block">
                <h3 className="club-contacts__meta-label">Юридический и почтовый адрес</h3>
                <p className="club-contacts__meta-value">{section.address}</p>
              </div>

              {section.phones.length > 0 && (
                <div className="club-contacts__meta-block">
                  <h3 className="club-contacts__meta-label">Телефоны</h3>
                  <ul className="club-contacts__phones">
                    {section.phones.map((phone) => (
                      <li key={phone.label}>
                        <span className="club-contacts__phone-label">{phone.label}:</span>{' '}
                        <a href={phone.href} className="club-contacts__phone-link">
                          {phone.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="club-contacts__meta-block">
                <h3 className="club-contacts__meta-label">E-mail</h3>
                <p className="club-contacts__meta-value">
                  <a href={`mailto:${section.email}`} className="club-contacts__email">
                    {section.email}
                  </a>
                </p>
              </div>
            </div>

            <ContactStaffTable rows={section.staff} />
          </section>
        ))}
      </div>
    </div>
  );
}
