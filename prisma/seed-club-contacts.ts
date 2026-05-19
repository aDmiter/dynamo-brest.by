/**
 * Импорт контактов из config/club-contacts.ts в БД.
 * Запуск: npx tsx prisma/seed-club-contacts.ts
 */
import { PrismaClient } from '@prisma/client';
import { CLUB_CONTACT_SECTIONS } from '../src/config/club-contacts';

const prisma = new PrismaClient();

async function main() {
  await prisma.clubContactsPage.upsert({
    where: { id: 'main' },
    create: {
      id: 'main',
      title: 'Контакты',
      subtitle: 'Клуб',
      lead: 'Реквизиты, телефоны и сотрудники администрации ФК «Динамо-Брест» и СДЮШОР',
    },
    update: {
      title: 'Контакты',
      subtitle: 'Клуб',
      lead: 'Реквизиты, телефоны и сотрудники администрации ФК «Динамо-Брест» и СДЮШОР',
    },
  });

  const existing = await prisma.clubContactSection.count();
  if (existing > 0) {
    console.log(`В БД уже ${existing} разделов — пропуск (удалите вручную для повторного импорта).`);
    return;
  }

  for (let i = 0; i < CLUB_CONTACT_SECTIONS.length; i++) {
    const section = CLUB_CONTACT_SECTIONS[i];
    await prisma.clubContactSection.create({
      data: {
        slug: section.id,
        title: section.title,
        legalName: section.legalName,
        address: section.address,
        email: section.email,
        sortOrder: i,
        phones: {
          create: section.phones.map((phone, pi) => ({
            label: phone.label,
            display: phone.display,
            href: phone.href,
            sortOrder: pi,
          })),
        },
        staff: {
          create: section.staff.map((person, si) => ({
            position: person.position,
            name: person.name,
            phone: person.phone,
            phoneHref: person.phoneHref,
            sortOrder: si,
          })),
        },
      },
    });
  }

  console.log(`Импортировано разделов: ${CLUB_CONTACT_SECTIONS.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
