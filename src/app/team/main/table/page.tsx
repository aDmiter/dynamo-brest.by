// src/app/team/main/table/page.tsx - Турнирная таблица
import PagePlaceholder from '@/modules/shared/ui/PagePlaceholder';
import { faTable } from '@fortawesome/free-solid-svg-icons';

export default function TablePage() {
  return (
    <PagePlaceholder
      title="Турнирная таблица"
      description="Текущее положение команд в чемпионате"
      icon={faTable}
    />
  );
}
