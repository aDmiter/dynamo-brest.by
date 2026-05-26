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
Полная синхронизация: кнопка в шапке админки → POST /api/sync/comet (матчи, протоколы, тренеры, игроки). Cron: GET /api/cron/sync-comet?token=CRON_SECRET, скрипт scripts/sync-comet-cron.ps1
Отдельные эндпоинты: /api/sync/matches, match-protocol, coaches, players
Ключи и URL — из env или настроек админки, не в коде
При sync позиции игроков не перезаписывать без явной задачи
Магазин
Оплата магазина: bePaid (виджет, по умолчанию) — `src/lib/bepaid.ts`, `src/app/api/bepaid/`; WebPay сохранён — `src/app/api/webpay/`, `src/lib/webpay`. Переключение: `NEXT_PUBLIC_SHOP_PAYMENT_PROVIDER=webpay`. Без ключей в dev: mock-оплата (`BEPAID_MOCK=1` или авто). Ключи: `BEPAID_SHOP_ID`, `BEPAID_SECRET_KEY`, `BEPAID_PUBLIC_KEY`, `BEPAID_TEST=1`
Товары, размеры, нанесения — Prisma + админка
Главное и нижнее меню — админка `/admin/settings/menu` (`menuitem` + `footermenuitem`)

- **Страница в коде** → тип **Ссылка**, URL из `src/config/coded-menu-routes.ts`.
- **CMSTextPage** — тип `page`, TipTap: `/page/[slug]`, `/legal/[slug]`, `/club/contacts` и др. Компонент `CmsTextPage`.
- `/admin/settings/footer-menu` → редирект на `/admin/settings/menu#footer-menu`.
- Исправление БД после сидов: `npx tsx prisma/fix-menu-coded-links.ts`.

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
