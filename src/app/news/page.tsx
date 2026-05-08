// src/app/news/page.tsx - Новости
import PagePlaceholder from '@/modules/shared/ui/PagePlaceholder';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';

export default function NewsPage() {
  return (
    <PagePlaceholder
      title="Новости"
      description="Последние новости ФК «Динамо-Брест»"
      icon={faNewspaper}
    />
  );
}
