const IMG_BASE = '/images/services/gym';

export const GYM_PHONE = '+375 162 20 85 32';
export const GYM_PHONE_HREF = 'tel:+375162208532';

export const gymHeroImage = `${IMG_BASE}/216A7477-JPG.jpg`;

export const gymSchedule = {
  title: 'Режим работы тренажерного зала:',
  rows: [
    { label: 'Будние дни', value: '10:00 – 22:00' },
    { label: 'Суббота', value: '09:00 – 21:00' },
    { label: 'Воскресенье', value: '09:00 – 21:00' },
    { label: 'Предпраздничные дни', value: '10:00 – 20:00' },
    { label: 'Праздничные дни', value: '09:00 – 21:00' },
  ],
};

export const gymGalleryImages = [
  '216A7477-JPG.jpg',
  '216A7474-JPG.jpg',
  '216A7445-JPG.jpg',
  '216A7450-JPG.jpg',
  '216A7444-JPG.jpg',
  '216A7447-JPG.jpg',
].map((name, i) => ({
  src: `${IMG_BASE}/${name}`,
  alt: `Тренажёрный зал — фото ${i + 1}`,
}));

export interface GymPriceRow {
  num: number;
  name: string;
  unit: string;
  price: string;
}

export const gymPrices: GymPriceRow[] = [
  { num: 1, name: 'Разовое посещение', unit: '1 посещ.', price: '7,00' },
  { num: 2, name: 'Абонемент на месяц', unit: '4 посещ.', price: '24,00' },
  { num: 3, name: 'Абонемент на месяц', unit: '8 посещ.', price: '44,00' },
  { num: 4, name: 'Абонемент на месяц', unit: '12 посещ.', price: '60,00' },
  { num: 5, name: 'Безлимитный', unit: '1 месяц', price: '72,00' },
  { num: 6, name: 'Персональная тренировка', unit: '1 час', price: '15,00' },
];
