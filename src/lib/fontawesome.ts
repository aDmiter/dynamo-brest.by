// src/lib/fontawesome.ts - Конфигурация Font Awesome
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Отключаем автоматический CSS (Next.js сам обработает)
config.autoAddCss = false;
