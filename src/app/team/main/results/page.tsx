// src/app/team/main/results/page.tsx - Результаты матчей
import PagePlaceholder from '@/modules/shared/ui/PagePlaceholder';
import { faListOl } from '@fortawesome/free-solid-svg-icons';

export default function ResultsPage() {
  return (
    <PagePlaceholder title="Результаты" description="Результаты прошедших матчей" icon={faListOl} />
  );
}
