// src/app/admin/dashboard/page.tsx — Дашборд админ-панели
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFutbol,
  faHandshake,
  faNewspaper,
  faStore,
  faUsers,
  faBell,
  faAd,
} from '@fortawesome/free-solid-svg-icons';
import DashboardGlassCard from '@/modules/admin/components/DashboardGlassCard';
import DashboardUpcomingMatches, {
  type UpcomingMatchCard,
} from '@/modules/admin/components/DashboardUpcomingMatches';
import {
  buildOpponentTeamMap,
  DYNAMO_BREST_DISPLAY_NAME,
  resolveMatchTeamNames,
} from '@/modules/team/lib/resolve-match-teams';

const UPCOMING_TEAMS = [
  { label: 'Основа', matchType: 'osnova', calendarSlug: 'osnovnoy-sostav' },
  { label: 'Дубль', matchType: 'dubl', calendarSlug: 'dubliruyushchiy-sostav' },
  { label: 'Женская', matchType: 'women', calendarSlug: 'zhenskaya-komanda' },
] as const;

export const metadata: Metadata = {
  title: 'Дашборд | Админ-панель',
};

function formatMoney(amount: number) {
  return (
    new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' BYN'
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const now = new Date();

  const [
    productsCount,
    ordersCount,
    paidOrdersSum,
    playersCount,
    coachesCount,
    newsCount,
    latestNews,
    upcomingMatchesCount,
    recentFinishedCount,
    pendingOrdersCount,
    activeBannersCount,
    sponsorsCount,
    categoriesCount,
    osnovaNextMatch,
    dublNextMatch,
    womenNextMatch,
    opponentTeams,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: 'paid' },
      _sum: { total: true },
    }),
    prisma.player.count({ where: { isActive: true } }),
    prisma.coach.count({ where: { isActive: true } }),
    prisma.news.count(),
    prisma.news.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { title: true, createdAt: true, isPublished: true },
    }),
    prisma.match.count({
      where: { status: 'scheduled', matchDate: { gte: now } },
    }),
    prisma.match.count({
      where: { status: 'finished', matchDate: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.order.count({
      where: { status: { in: ['pending_payment', 'unpaid', 'new', 'received'] } },
    }),
    prisma.banner.count({ where: { isActive: true } }),
    prisma.sponsor.count(),
    prisma.productcategory.count(),
    prisma.match.findFirst({
      where: { matchType: 'osnova', status: 'scheduled', matchDate: { gte: now } },
      orderBy: { matchDate: 'asc' },
    }),
    prisma.match.findFirst({
      where: { matchType: 'dubl', status: 'scheduled', matchDate: { gte: now } },
      orderBy: { matchDate: 'asc' },
    }),
    prisma.match.findFirst({
      where: { matchType: 'women', status: 'scheduled', matchDate: { gte: now } },
      orderBy: { matchDate: 'asc' },
    }),
    prisma.opponentTeam.findMany({
      where: { isActive: true },
      select: { cometId: true, name: true, logoUrl: true },
    }),
  ]);

  const paidTotal = Number(paidOrdersSum._sum.total ?? 0);
  const publishedNewsCount = await prisma.news.count({ where: { isPublished: true } });

  const opponentMap = buildOpponentTeamMap(opponentTeams);
  const nextByType = {
    osnova: osnovaNextMatch,
    dubl: dublNextMatch,
    women: womenNextMatch,
  } as const;

  const upcomingMatchCards: UpcomingMatchCard[] = UPCOMING_TEAMS.map((team) => {
    const raw = nextByType[team.matchType];
    const calendarHref = `/admin/matches/calendar/${team.calendarSlug}`;

    if (!raw) {
      return { teamLabel: team.label, calendarHref, match: null };
    }

    const { homeTeam, awayTeam } = resolveMatchTeamNames(
      raw,
      DYNAMO_BREST_DISPLAY_NAME,
      opponentMap,
    );

    return {
      teamLabel: team.label,
      calendarHref,
      match: {
        id: raw.id,
        homeTeam,
        awayTeam,
        isHome: raw.isHome,
        matchDate: raw.matchDate,
        tournament: raw.tournament,
        round: raw.round,
        stadium: raw.stadium,
      },
    };
  });

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
          {now.toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <h1
          className="font-heading text-3xl font-bold text-white md:text-4xl"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
        >
          Добро пожаловать, {session?.user?.name || 'Администратор'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          Краткий обзор магазина, составов, контента и ближайших матчей. Перейдите в раздел по клику на
          показатель.
        </p>
      </header>

      <DashboardUpcomingMatches cards={upcomingMatchCards} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardGlassCard
          featured
          title="Интернет-магазин"
          description="Каталог, заказы и выручка по оплаченным заказам"
          icon={faStore}
          primaryHref="/admin/shop"
          primaryLabel="Обзор магазина"
          stats={[
            {
              label: 'Товаров',
              value: productsCount,
              hint: `${categoriesCount} категорий`,
              href: '/admin/products',
            },
            {
              label: 'Заказов',
              value: ordersCount,
              hint: pendingOrdersCount > 0 ? `${pendingOrdersCount} ждут оплаты` : 'Всего в базе',
              href: '/admin/orders',
            },
            {
              label: 'Оплачено',
              value: formatMoney(paidTotal),
              hint: 'Сумма заказов со статусом «Оплачен»',
              href: '/admin/orders',
            },
          ]}
        />

        <DashboardGlassCard
          title="Составы и тренеры"
          description="Активные игроки и тренерский штаб в админке"
          icon={faUsers}
          primaryHref="/admin/players"
          primaryLabel="Все игроки"
          stats={[
            {
              label: 'Игроков',
              value: playersCount,
              hint: 'Активные в системе',
              href: '/admin/players',
            },
            {
              label: 'Тренеров',
              value: coachesCount,
              hint: 'Активные в системе',
              href: '/admin/coaches',
            },
          ]}
        />

        <DashboardGlassCard
          title="Новости"
          description="Публикации на сайте"
          icon={faNewspaper}
          primaryHref="/admin/news"
          primaryLabel="Управление новостями"
          stats={[
            {
              label: 'Всего новостей',
              value: newsCount,
              hint: `${publishedNewsCount} опубликовано`,
              href: '/admin/news',
            },
            {
              label: 'Последняя',
              value: latestNews
                ? new Date(latestNews.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—',
              hint: latestNews
                ? `${latestNews.isPublished ? 'Опубликована' : 'Черновик'}: ${latestNews.title.length > 48 ? `${latestNews.title.slice(0, 48)}…` : latestNews.title}`
                : 'Новостей пока нет',
              href: '/admin/news',
            },
          ]}
        />

        <DashboardGlassCard
          title="Матчи"
          description="Календарь и недавние результаты"
          icon={faFutbol}
          primaryHref="/admin/matches/calendar/osnovnoy-sostav"
          primaryLabel="Календарь основного состава"
          stats={[
            {
              label: 'Предстоящие',
              value: upcomingMatchesCount,
              hint: 'Запланированные матчи',
              href: '/admin/matches/calendar/osnovnoy-sostav',
            },
            {
              label: 'За 30 дней',
              value: recentFinishedCount,
              hint: 'Сыгранные матчи',
              href: '/admin/matches/results/osnovnoy-sostav',
            },
          ]}
        />

        <DashboardGlassCard
          title="Требуют внимания"
          description="Заказы и контент, который стоит проверить"
          icon={faBell}
          primaryHref="/admin/orders"
          primaryLabel="Открыть заказы"
          stats={[
            {
              label: 'Не оплачены',
              value: pendingOrdersCount,
              hint: 'Новые и ожидают оплаты',
              href: '/admin/orders',
            },
            {
              label: 'Черновики новостей',
              value: newsCount - publishedNewsCount,
              hint: 'Без публикации на сайте',
              href: '/admin/news',
            },
          ]}
        />

        <DashboardGlassCard
          title="Медиа и партнёры"
          description="Баннеры на главной и спонсоры клуба"
          icon={faHandshake}
          primaryHref="/admin/banners"
          primaryLabel="Баннеры"
          stats={[
            {
              label: 'Баннеров',
              value: activeBannersCount,
              hint: 'Активных сейчас',
              href: '/admin/banners',
            },
            {
              label: 'Спонсоров',
              value: sponsorsCount,
              href: '/admin/sponsors',
            },
          ]}
        />
      </div>

      <p className="mt-8 flex items-center gap-2 text-xs text-gray-600">
        <FontAwesomeIcon icon={faAd} className="text-[#ee862c]/60" />
        Данные обновляются при загрузке страницы
      </p>
    </div>
  );
}
