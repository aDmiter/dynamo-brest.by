import { getSetting } from '@/lib/settings';
import { syncAll } from '@/app/api/sync/matches/route';

export type CometMatchesSyncResult = {
  success: true;
  logs: string[];
};

export async function syncMatchesFromComet(): Promise<
  CometMatchesSyncResult | { success: false; error: string }
> {
  const matchesKey =
    (await getSetting('COMET_API_KEY_MATCHES')) || process.env.COMET_API_KEY_MATCHES || '';
  const facilitiesKey =
    (await getSetting('COMET_API_KEY_FACILITIES')) || process.env.COMET_API_KEY_FACILITIES || '';

  if (!matchesKey || !facilitiesKey) {
    return { success: false, error: 'Ключи COMET для матчей и стадионов не настроены' };
  }

  const logs = await syncAll(matchesKey, facilitiesKey);
  return { success: true, logs };
}
