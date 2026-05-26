import { syncMatchProtocolData } from '@/lib/match-protocol-sync';
import { syncCoachesFromComet } from '@/lib/comet-sync/sync-coaches';
import { syncMatchesFromComet } from '@/lib/comet-sync/sync-matches';
import { syncPlayersFromComet } from '@/lib/comet-sync/sync-players';

export type CometSyncStepId = 'matches' | 'protocols' | 'coaches' | 'players';

export type CometSyncStepResult = {
  step: CometSyncStepId;
  label: string;
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
};

export type CometFullSyncResult = {
  success: boolean;
  steps: CometSyncStepResult[];
  durationSeconds: string;
};

const STEPS: Array<{ id: CometSyncStepId; label: string }> = [
  { id: 'matches', label: 'Матчи и клубы' },
  { id: 'protocols', label: 'Протоколы матчей' },
  { id: 'coaches', label: 'Тренеры' },
  { id: 'players', label: 'Игроки' },
];

export async function runFullCometSync(): Promise<CometFullSyncResult> {
  const start = Date.now();
  const steps: CometSyncStepResult[] = [];

  for (const { id, label } of STEPS) {
    try {
      if (id === 'matches') {
        const result = await syncMatchesFromComet();
        if (result.success) {
          const tail = result.logs.slice(-3).join(' · ');
          steps.push({
            step: id,
            label,
            success: true,
            message: tail || 'Готово',
            details: { logs: result.logs },
          });
        } else {
          steps.push({ step: id, label, success: false, message: result.error });
        }
        continue;
      }

      if (id === 'protocols') {
        const logs = await syncMatchProtocolData();
        const tail = logs.slice(-4).join(' · ');
        steps.push({
          step: id,
          label,
          success: true,
          message: tail || 'Готово',
          details: { logs },
        });
        continue;
      }

      if (id === 'coaches') {
        const result = await syncCoachesFromComet();
        if (result.success) {
          steps.push({
            step: id,
            label,
            success: true,
            message: `создано ${result.created}, обновлено ${result.updated}, деактивировано ${result.deactivated}`,
            details: result,
          });
        } else {
          steps.push({ step: id, label, success: false, message: result.error });
        }
        continue;
      }

      if (id === 'players') {
        const result = await syncPlayersFromComet();
        if (result.success) {
          const errNote =
            result.errors.length > 0 ? `, ошибок: ${result.errors.length}` : '';
          steps.push({
            step: id,
            label,
            success: true,
            message: `создано ${result.created}, обновлено ${result.updated}${errNote}`,
            details: result,
          });
        } else {
          steps.push({ step: id, label, success: false, message: result.error });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      steps.push({ step: id, label, success: false, message });
    }
  }

  const durationSeconds = ((Date.now() - start) / 1000).toFixed(1);
  const success = steps.every((s) => s.success);

  return { success, steps, durationSeconds };
}
