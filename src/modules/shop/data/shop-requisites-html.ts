import { escapeHtml } from '@/lib/html';
import {
  ORG_FULL_NAME,
  ORG_LEGAL_ADDRESS,
  ORG_STATE_REGISTRATION,
  ORG_STATE_REGISTRATION_DATE,
  ORG_TRADE_REGISTRY_LINE,
  ORG_UNP,
  SHOP_CONTACT_EMAIL,
  SHOP_CONTACT_PHONE,
  SHOP_CONTACT_PHONE_HREF,
  SHOP_WORKING_HOURS,
} from '@/modules/shop/data/organization-requisites';

/** Блок реквизитов продавца для CMS-страниц магазина. */
export function shopRequisitesCmsHtml(): string {
  const stateRegLine = `Регистрирующий орган: ${ORG_STATE_REGISTRATION}, ${ORG_STATE_REGISTRATION_DATE}, УНП ${ORG_UNP}`;

  return `<div class="transport-services__seller-requisites">
<p class="transport-services__vehicle-desc">${escapeHtml(ORG_FULL_NAME)}</p>
<p class="transport-services__vehicle-desc">${escapeHtml(stateRegLine)}</p>
<p class="transport-services__vehicle-desc">${escapeHtml(ORG_LEGAL_ADDRESS)}</p>
<p class="transport-services__vehicle-desc">Режим работы интернет-магазина: ${escapeHtml(SHOP_WORKING_HOURS)}</p>
<p class="transport-services__vehicle-desc">${escapeHtml(ORG_TRADE_REGISTRY_LINE)}</p>
<p class="transport-services__vehicle-desc">E-mail: <a href="mailto:${SHOP_CONTACT_EMAIL}">${escapeHtml(SHOP_CONTACT_EMAIL)}</a> · Телефон: <a href="${SHOP_CONTACT_PHONE_HREF}">${escapeHtml(SHOP_CONTACT_PHONE)}</a></p>
</div>`;
}
