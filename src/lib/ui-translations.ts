import {
  UI_TRANSLATION_DEFAULTS,
  type UiTranslationKey,
} from '@/config/ui-translations';
import { pickLocalized, type SiteLang } from '@/lib/site-locale';

export type UiTranslator = (key: UiTranslationKey) => string;

export function createUiTranslator(
  lang: SiteLang,
  beOverrides: Record<string, string> = {},
): UiTranslator {
  if (lang === 'ru') {
    return (key) => UI_TRANSLATION_DEFAULTS[key];
  }
  return (key) => pickLocalized(UI_TRANSLATION_DEFAULTS[key], beOverrides[key]);
}
