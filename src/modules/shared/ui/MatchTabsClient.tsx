// Переключатель версий UI секции матчей (base | v1)
import { MATCH_SECTION_UI_VERSION } from './match-section/config';
import type { MatchTabsClientProps } from './match-section/types';
import MatchTabsClientBase from './match-section/base/MatchTabsClient';
import MatchTabsClientV1 from './match-section/v1/MatchTabsClient';

export default function MatchTabsClient(props: MatchTabsClientProps) {
  if (MATCH_SECTION_UI_VERSION === 'v1') {
    return <MatchTabsClientV1 {...props} />;
  }
  return <MatchTabsClientBase {...props} />;
}
