import TranslationsAdmin from '@/modules/admin/components/TranslationsAdmin';

export const dynamic = 'force-dynamic';

export default function AdminTranslationsPage() {
  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl font-bold text-white">Переводы интерфейса</h1>
      <p className="mb-8 text-sm text-gray-400">
        Здесь — подписи интерфейса (шапка, подвал). Белорусские тексты новостей и CMS-страниц
        задаются в формах редактирования новости и в настройках меню.
      </p>
      <TranslationsAdmin />
    </div>
  );
}
