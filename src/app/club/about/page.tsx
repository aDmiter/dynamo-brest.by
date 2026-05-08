// src/app/club/about/page.tsx - О клубе
import PagePlaceholder from '@/modules/shared/ui/PagePlaceholder';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function AboutPage() {
  return (
    <PagePlaceholder
      title="О клубе"
      description="История и информация о футбольном клубе «Динамо-Брест»"
      icon={faInfoCircle}
    />
  );
}
