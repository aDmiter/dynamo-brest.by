// src/modules/config/social.ts - Конфигурация социальных сетей
import {
  faFacebookF,
  faVk,
  faXTwitter,
  faInstagram,
  faOdnoklassniki,
  faTelegram,
  faYoutube,
  faTiktok,
} from '@fortawesome/free-brands-svg-icons';

export interface SocialLink {
  icon: typeof faFacebookF;
  href: string;
  label: string;
}

export const socialLinks: SocialLink[] = [
  { icon: faFacebookF, href: 'https://facebook.com/dynamobrest', label: 'Facebook' },
  { icon: faVk, href: 'https://vk.com/dynamobrest', label: 'VK' },
  { icon: faXTwitter, href: 'https://x.com/dynamobrest', label: 'X' },
  { icon: faInstagram, href: 'https://instagram.com/dynamobrest', label: 'Instagram' },
  { icon: faOdnoklassniki, href: 'https://ok.ru/dynamobrest', label: 'OK' },
  { icon: faTelegram, href: 'https://t.me/dynamobrest', label: 'Telegram' },
  { icon: faYoutube, href: 'https://youtube.com/dynamobrest?sub_confirmation=1', label: 'YouTube' },
  { icon: faTiktok, href: 'https://www.tiktok.com/@dynamobrest', label: 'TikTok' },
];
