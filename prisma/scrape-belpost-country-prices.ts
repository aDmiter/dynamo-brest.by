/**
 * CLI: синхронизация тарифов Belpost (то же, что кнопка в админке).
 * npx tsx prisma/scrape-belpost-country-prices.ts
 */
import { syncBelpostCountryPrices } from '../src/lib/belpost-country-sync';

async function main() {
  console.log('Синхронизация тарифов Belpost...\n');
  const summary = await syncBelpostCountryPrices();

  for (const item of summary.items) {
    if (item.status === 'updated') {
      console.log(
        `${item.code}  ${item.name}: ${item.rawPrice!.toFixed(2)} → ${item.price!.toFixed(2)} BYN`
      );
    } else if (item.status === 'unavailable') {
      console.log(`${item.code}  ${item.name}: отключена (${item.message})`);
    } else if (item.status === 'skipped') {
      console.log(`${item.code}  ${item.name}: пропуск`);
    } else {
      console.log(`${item.code}  ${item.name}: ошибка — ${item.message}`);
    }
  }

  console.log(
    `\nГотово: обновлено ${summary.updated}, отключено ${summary.unavailable}, пропущено ${summary.skipped}, ошибок ${summary.errors}.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
