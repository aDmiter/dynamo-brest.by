Динамо-Брест — инструкция для AI
Проект
Официальный сайт ФК «Динамо-Брест»: новости, состав, матчи, турнирная таблица, клуб, школа, интернет-магазин, админ-панель.

Стек
Next.js 16 (App Router), TypeScript
Prisma + MySQL
Tailwind CSS, shadcn/ui
NextAuth — админка
Публичный UI: BEM + CSS-переменные в src/app/globals.css
Запуск
pnpm install
pnpm dev
pnpm build
pnpm lint
npx prisma migrate dev
Папки
src/app/ — страницы и API
src/app/admin/ — админка
src/app/api/ — API (sync, players, matches, webpay и т.д.)
src/modules/team/ — состав, матчи, таблица
src/modules/shop/ — магазин
src/modules/admin/ — компоненты админки
src/modules/shared/ui/ — Header, Footer, HeroSlider и др.
prisma/ — схема и миграции
src/lib/ — утилиты, webpay, middleware
Импорты: @/ → src/

Составы команды
Состав slug COMET clubId
Основной
main
68812
Дубль
reserve
102734
Женская
women
101132
Маршруты: /team/[slug]/players, calendar, results, table.

Статистика игроков: в API передавать teamSlug. Кэш в PlayersGrid: localStorage, ключ ps\_${teamSlug}, TTL 30 минут.

COMET
Синхронизация игроков, тренеров, матчей через /api/sync/\*
Ключи и URL — из env или настроек админки, не в коде
При sync позиции игроков не перезаписывать без явной задачи
Магазин
WebPay: src/app/api/webpay/, src/lib/webpay
Товары, размеры, нанесения — Prisma + админка
Главное меню (`menuitem`, админка `/admin/settings/menu`)

- **Страница в коде** (`src/app/.../page.tsx`) → тип **Ссылка**, поле URL = маршрут (`/page/tickets`, `/services/gym`, `/team/main/players`). Реестр coded-путей: `src/config/coded-menu-routes.ts`.
- **Текстовая CMS-страница** (контент только из редактора в БД) → тип **Текстовая страница**, slug без отдельного `page.tsx` с тем же именем.
- Исправление БД после сидов: `npx tsx prisma/fix-menu-coded-links.ts` (без удаления всего меню).

Правила работы
Менять только то, что нужно для задачи.
Стиль кода — как в соседних файлах модуля.
Коммиты и push — только по просьбе пользователя.
Не коммитить секреты (.env, пароли SMTP, COMET, WebPay).
Не добавлять лишние markdown-файлы и комментарии без запроса.
После правок Prisma — миграция; после крупных правок — pnpm lint и pnpm build.
Язык
Интерфейс и сообщения — русский.

Как ставить задачу
Указывать модуль (team / shop / admin / news), путь к файлу или URL страницы, состав (main / reserve / women), если это важно.
