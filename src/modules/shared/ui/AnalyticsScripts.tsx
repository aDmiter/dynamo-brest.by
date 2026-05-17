import { getAnalyticsSettings, splitYandexMetrika } from '@/lib/analytics';
import AnalyticsInjector from './AnalyticsInjector';

export default async function AnalyticsScripts() {
  const { google, yandex } = await getAnalyticsSettings();
  const { head: yandexHead, body: yandexBody } = splitYandexMetrika(yandex);

  if (!google && !yandexHead && !yandexBody) {
    return null;
  }

  return (
    <AnalyticsInjector googleHead={google} yandexHead={yandexHead} yandexBody={yandexBody} />
  );
}
