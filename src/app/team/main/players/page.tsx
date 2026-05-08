// src/app/team/main/players/page.tsx - Основной состав
import PagePlaceholder from '@/modules/shared/ui/PagePlaceholder';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

export default function PlayersPage() {
  return (
    <PagePlaceholder
      title="Основной состав"
      description="Список игроков основного состава ФК «Динамо-Брест»"
      icon={faUsers}
    />
  );
}
