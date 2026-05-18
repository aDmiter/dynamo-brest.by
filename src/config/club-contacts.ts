export interface ClubContactPhone {
  label: string;
  display: string;
  href: string;
}

export interface ClubContactPerson {
  position: string;
  name: string;
  phone: string;
  phoneHref: string;
}

export interface ClubContactSection {
  id: string;
  title: string;
  legalName: string;
  address: string;
  phones: ClubContactPhone[];
  email: string;
  staff: ClubContactPerson[];
}

function person(
  position: string,
  name: string,
  phoneDigits: string,
  phoneDisplay: string
): ClubContactPerson {
  return {
    position,
    name,
    phone: phoneDisplay,
    phoneHref: `tel:${phoneDigits}`,
  };
}

export const CLUB_CONTACT_SECTIONS: ClubContactSection[] = [
  {
    id: 'club',
    title: 'Футбольный клуб',
    legalName:
      'Учреждение физической культуры и спорта «Государственный футбольный клуб «Динамо-Брест»»',
    address: '224030, г. Брест, ул. Гоголя, 9',
    phones: [
      {
        label: 'Приёмная (тел./факс)',
        display: '+375 (162) 20-84-59',
        href: 'tel:+375162208459',
      },
      {
        label: 'Бухгалтерия',
        display: '+375 (162) 20-85-58',
        href: 'tel:+375162208558',
      },
    ],
    email: 'info@dynamo-brest.by',
    staff: [
      person('Директор', 'Невдах Александр Владимирович', '+375162208459', '+375 162 20 84 59'),
      person(
        'Первый заместитель директора',
        'Щегрикович Василий Михайлович',
        '+375162216233',
        '+375 162 21 62 33'
      ),
      person(
        'Заместитель директора по АХЧ',
        'Шумко Василий Петрович',
        '+375162208459',
        '+375 162 20 84 59'
      ),
      person(
        'Заместитель директора по развитию',
        'Стасюк Дмитрий Александрович',
        '+375162208459',
        '+375 162 20 84 59'
      ),
      person(
        'Главный бухгалтер',
        'Шипилова Анастасия Викторовна',
        '+375162208558',
        '+375 162 20 85 58'
      ),
      person(
        'Начальник лицензионно-коммерческого отдела',
        'Лазарук Андрей Владимирович',
        '+375162208541',
        '+375 162 20 85 41'
      ),
    ],
  },
  {
    id: 'school',
    title: 'Детско-юношеская спортивная школа',
    legalName:
      'Обособленное структурное подразделение «Специализированная детско-юношеская школа олимпийского резерва» учреждения физической культуры и спорта «Государственный футбольный клуб «Динамо-Брест»»',
    address: '224020, г. Брест, ул. Высокая, д. 19',
    phones: [],
    email: 'corfootball@brest.by',
    staff: [
      person('Директор', 'Ковальчук Сергей Петрович', '+375162561960', '+375 162 56 19 60'),
      person(
        'Заместитель директора по основной деятельности',
        'Нестер Игорь Владимирович',
        '+375162351960',
        '+375 162 35 19 60'
      ),
      person(
        'Инструктор-методист',
        'Голодко Роман Геннадьевич',
        '+375162351960',
        '+375 162 35 19 60'
      ),
      person(
        'Инструктор-методист',
        'Гутник Алеся Сергеевна',
        '+375162351960',
        '+375 162 35 19 60'
      ),
    ],
  },
];
