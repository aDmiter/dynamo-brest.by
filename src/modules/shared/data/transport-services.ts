const IMG_BASE = '/images/services/buses';
export const TRANSPORT_PHONE = '+375 162 20 85 41';
export const TRANSPORT_PHONE_HREF = 'tel:+375162208541';

export const transportHeroImage = `${IMG_BASE}/mercedes/mercedes_1.jpg`;

export interface TransportVehicle {
  id: string;
  title: string;
  description: string;
  contactName: string;
  images: { src: string; alt: string }[];
}

export const transportVehicles: TransportVehicle[] = [
  {
    id: 'crafter',
    title: 'Микроавтобус Volkswagen Crafter',
    description: 'Новый комфортабельный микроавтобус на 20 посадочных мест.',
    contactName: 'Volkswagen Crafter',
    images: Array.from({ length: 12 }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return {
        src: `${IMG_BASE}/crafter/crafter_${n}.jpg`,
        alt: `Volkswagen Crafter — фото ${i + 1}`,
      };
    }),
  },
  {
    id: 'mercedes',
    title: 'Автобус Mercedes',
    description: 'Автобус на 45 посадочных мест.',
    contactName: 'Mercedes',
    images: Array.from({ length: 6 }, (_, i) => ({
      src: `${IMG_BASE}/mercedes/mercedes_${i + 1}.jpg`,
      alt: `Mercedes — фото ${i + 1}`,
    })),
  },
  {
    id: 'man',
    title: 'Автобус Man',
    description: 'Автобус на 49 посадочных мест.',
    contactName: 'Man',
    images: Array.from({ length: 5 }, (_, i) => ({
      src: `${IMG_BASE}/man/man_${i + 1}.jpg`,
      alt: `Man — фото ${i + 1}`,
    })),
  },
];
