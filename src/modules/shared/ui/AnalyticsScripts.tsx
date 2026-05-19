import { getAnalyticsConfig } from '@/lib/analytics';
import AnalyticsCounters from './AnalyticsCounters';

export default async function AnalyticsScripts() {
  const { googleId, yandexId, googleEnabled, yandexEnabled } = await getAnalyticsConfig();
  return (
    <AnalyticsCounters
      googleId={googleEnabled ? googleId : ''}
      yandexId={yandexEnabled ? yandexId : ''}
    />
  );
}
