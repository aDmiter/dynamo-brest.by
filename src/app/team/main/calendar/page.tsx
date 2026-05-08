// src/app/team/main/calendar/page.tsx - Календарь матчей
import PagePlaceholder from '@/modules/shared/ui/PagePlaceholder';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

export default function CalendarPage() {
  return (
    <PagePlaceholder
      title="Календарь матчей"
      description="Расписание будущих матчей команды"
      icon={faCalendarDays}
    />
  );
}
