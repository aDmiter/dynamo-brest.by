import {
  FIELDS_PHONE,
  FIELDS_PHONE_HREF,
  fieldsVenues,
  isFieldsGroupHeader,
} from '@/modules/shared/data/fields-services';
import {
  GYM_PHONE,
  GYM_PHONE_HREF,
  gymGalleryImages,
  gymPrices,
  gymSchedule,
} from '@/modules/shared/data/gym-services';
import {
  BEPAID_PAYMENT_INFO_URL,
  BEPAID_SITE_URL,
  ORDER_STEPS,
  SHOP_POSTAL_ADDRESS,
  SHOP_SUPPORT_EMAIL,
  SHOP_SUPPORT_PHONE,
  SHOP_SUPPORT_PHONE_HREF,
} from '@/modules/shop/data/shop-info';
import {
  TRANSPORT_PHONE,
  TRANSPORT_PHONE_HREF,
  transportVehicles,
} from '@/modules/shared/data/transport-services';
import { escapeHtml } from '@/lib/html';
import {
  dividerHtml,
  galleryHtml,
  placeholderHtml,
  sectionHtml,
  wrapCmsPageContent,
} from '@/lib/cms-page-html/helpers';
import { clubPartnersPageHtml } from '@/lib/club-partners-html';
import { clubStadiumPageHtml } from '@/lib/club-stadium-html';
import { mediaAnthemsPageHtml } from '@/lib/cms-page-html/media-anthems-html';
import { mediaPressPageHtml } from '@/lib/cms-page-html/media-press-html';

export function transportPageHtml(): string {
  const sections = transportVehicles
    .map((vehicle, index) => {
      const divider = index > 0 ? dividerHtml() : '';
      return `${divider}<section class="transport-services__vehicle" aria-labelledby="vehicle-${vehicle.id}">
<h2 id="vehicle-${vehicle.id}" class="transport-services__vehicle-title">${escapeHtml(vehicle.title)}</h2>
<p class="transport-services__vehicle-desc">${escapeHtml(vehicle.description)}</p>
<p class="transport-services__phone">Информация по ценам на перевозку ${escapeHtml(vehicle.contactName)} и маршрутам по телефону: <a href="${TRANSPORT_PHONE_HREF}">${escapeHtml(TRANSPORT_PHONE)}</a></p>
${galleryHtml(vehicle.images)}
</section>`;
    })
    .join('\n');

  return wrapCmsPageContent(`<p class="transport-services__lead">Футбольный клуб «Динамо-Брест» предлагает <strong>услуги автобусов</strong> с водителем для осуществления <em>пассажирских перевозок</em> по РБ, странам СНГ, Прибалтики и Европы.</p>
${sections}`);
}

export function fieldsPageHtml(): string {
  const sections = fieldsVenues
    .map((venue, index) => {
      const rows = venue.rows
        .map((row, rowIndex) =>
          isFieldsGroupHeader(row)
            ? `<tr><td colspan="4" class="transport-services__table-group"><strong>${escapeHtml(row.groupHeader)}</strong></td></tr>`
            : `<tr><td>${row.num}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.unit)}</td><td>${escapeHtml(row.price)}</td></tr>`,
        )
        .join('');
      const caption = venue.tableCaption
        ? `<caption class="transport-services__table-caption">${escapeHtml(venue.tableCaption)}</caption>`
        : '';
      const divider = index > 0 ? dividerHtml() : '';
      return `${divider}<section class="transport-services__vehicle" aria-labelledby="fields-venue-${venue.id}">
<h2 id="fields-venue-${venue.id}" class="transport-services__vehicle-title">${escapeHtml(venue.title)}</h2>
<div class="transport-services__venue-photo"><img src="${escapeHtml(venue.image)}" alt="${escapeHtml(venue.title)}" loading="lazy" /></div>
<div class="transport-services__table-wrap"><table class="transport-services__table">${caption}<thead><tr><th>№ п/п</th><th>Наименование услуг</th><th>Ед. изм.</th><th>Сумма с НДС, руб.</th></tr></thead><tbody>${rows}</tbody></table></div>
</section>`;
    })
    .join('\n');

  return wrapCmsPageContent(`<p class="transport-services__lead">Футбольный клуб «Динамо-Брест» предлагает <strong>услуги футбольных полей</strong> с естественным и искусственным покрытием.</p>
${sections}
<p class="transport-services__phone transport-services__phone--footer">Телефон: <a href="${FIELDS_PHONE_HREF}">${escapeHtml(FIELDS_PHONE)}</a></p>`);
}

export function gymPageHtml(): string {
  const schedule = gymSchedule.rows
    .map((row) => `<li><span>${escapeHtml(row.label)}:</span> ${escapeHtml(row.value)}</li>`)
    .join('');
  const priceRows = gymPrices
    .map(
      (row) =>
        `<tr><td>${row.num}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.unit)}</td><td>${escapeHtml(row.price)}</td></tr>`,
    )
    .join('');

  return wrapCmsPageContent(`<aside class="transport-services__schedule">
<p class="transport-services__schedule-title">${escapeHtml(gymSchedule.title)}</p>
<ul class="transport-services__schedule-list">${schedule}</ul>
</aside>
${galleryHtml(gymGalleryImages)}
<p class="transport-services__lead transport-services__lead--after-gallery">Футбольный клуб «Динамо-Брест» предлагает посетить тренажёрный зал на стадионе «Брестский» по адресу: <strong>ул. Гоголя, 9</strong>.</p>
<section class="transport-services__vehicle" aria-labelledby="gym-prices-title">
<h2 id="gym-prices-title" class="transport-services__vehicle-title">Стоимость услуг</h2>
<div class="transport-services__table-wrap"><table class="transport-services__table"><thead><tr><th>№ п/п</th><th>Наименование услуг</th><th>Ед. изм.</th><th>Сумма, руб.</th></tr></thead><tbody>${priceRows}</tbody></table></div>
</section>
<p class="transport-services__phone transport-services__phone--footer">Телефон: <a href="${GYM_PHONE_HREF}">${escapeHtml(GYM_PHONE)}</a></p>`);
}

export function cafePageHtml(): string {
  return wrapCmsPageContent(`<p class="transport-services__lead">Кафе домашней кухни «5 колец» возобновляет работу и приглашает гостей в обновлённый банкетный зал.</p>
<p class="transport-services__vehicle-desc">Мы располагаем двумя залами на 50 гостей и банкетный зал на 25 гостей.</p>
<p class="transport-services__vehicle-desc"><strong>«5 колец»</strong> — это уютное место для душевных встреч!</p>
<section class="transport-services__vehicle" aria-labelledby="cafe-events">
<h2 id="cafe-events" class="transport-services__vehicle-title">Мы поможем организовать</h2>
<ul class="transport-services__schedule-list">
<li>семейные торжества (юбилеи, дни рождения, крестины и др.);</li>
<li>корпоративы;</li>
<li>вечера встреч с выпускниками;</li>
</ul>
</section>
<section class="transport-services__vehicle" aria-labelledby="cafe-menu">
<h2 id="cafe-menu" class="transport-services__vehicle-title">Также</h2>
<ul class="transport-services__schedule-list">
<li>вкусные недорогие горячие обеды индивидуальной комплектации;</li>
<li>свежая выпечка;</li>
</ul>
<p class="transport-services__vehicle-desc">Мы умеем и любим вкусно кормить!</p>
</section>
<p class="transport-services__phone transport-services__phone--footer">Телефон: <a href="tel:+375162208514">+375 162 20 85 14</a></p>`);
}

export function hotelPageHtml(): string {
  return wrapCmsPageContent(`<p class="transport-services__lead">Гостиница <strong>«5 колец»</strong> — уютный отель в самом центре Бреста на базе ФК «Динамо-Брест». Удобное расположение рядом со стадионом «Брестский» и городской инфраструктурой.</p>
<p class="transport-services__vehicle-desc">Адрес: <strong>ул. Гоголя, 9</strong>, г. Брест.</p>
${sectionHtml(
  'hotel-about',
  'О гостинице',
  `<p class="transport-services__vehicle-desc">Гостиница «5 колец» предлагает комфортное размещение для гостей города, участников спортивных мероприятий и болельщиков «Динамо-Брест». Номера оборудованы всем необходимым для отдыха после матча или деловой поездки.</p>
<p class="transport-services__vehicle-desc">На территории спортивного комплекса также работают кафе «5 колец» и тренажёрный зал — всё в шаговой доступности от вашего номера.</p>`,
)}
${sectionHtml(
  'hotel-services',
  'Услуги',
  `<ul class="transport-services__schedule-list">
<li>проживание в одноместных и двухместных номерах;</li>
<li>завтраки и питание в кафе «5 колец»;</li>
<li>парковка для гостей;</li>
<li>удобный доступ к стадиону и спортивным объектам.</li>
</ul>`,
)}
<p class="transport-services__phone transport-services__phone--footer">Бронирование и справки: <a href="tel:+375162208514">+375 162 20 85 14</a></p>`);
}

export function shopDeliveryPageHtml(): string {
  return wrapCmsPageContent(`<p class="transport-services__lead">Доставка заказов интернет-магазина ФК «Динамо-Брест» осуществляется по адресу, указанному покупателем при оформлении заказа.</p>
${sectionHtml(
  'shop-delivery-belpost',
  'РУП «Белпочта»',
  `<p class="transport-services__vehicle-desc">Отправление заказов по Республике Беларусь и в другие страны выполняется РУП «Белпочта» экспресс-посылкой EMS в соответствии с действующими тарифами и правилами оператора почтовой связи. Стоимость доставки рассчитывается при оформлении заказа в зависимости от выбранной страны назначения.</p>
<p class="transport-services__vehicle-desc">Сроки доставки зависят от региона получателя и устанавливаются «Белпочтой» для услуги EMS. После отправления заказа на указанный при оформлении e-mail направляется уведомление с информацией для отслеживания отправления.</p>`,
)}
${sectionHtml(
  'shop-delivery-order',
  'После оплаты',
  `<p class="transport-services__vehicle-desc">После успешной оплаты банковской картой через bePaid заказ передаётся на комплектацию и отправку. Доставка осуществляется только после подтверждения оплаты.</p>`,
)}
<p class="transport-services__phone transport-services__phone--footer">Почтовый адрес продавца: ${escapeHtml(SHOP_POSTAL_ADDRESS)}</p>`);
}

export function shopPaymentPageHtml(): string {
  const steps = ORDER_STEPS.map((step) => `<li>${escapeHtml(step)}</li>`).join('');
  return wrapCmsPageContent(`<p class="transport-services__lead">Оплата товаров в интернет-магазине ФК «Динамо-Брест» производится в белорусских рублях (BYN) банковской платёжной картой через платёжный сервис <a href="${BEPAID_SITE_URL}" target="_blank" rel="noopener noreferrer">bePaid (bepaid.by)</a>. Допустимы карты Visa, Mastercard, Белкарт, Мир, Apple Pay, Google Pay и другие способы, доступные на платёжной форме.</p>
${sectionHtml(
  'shop-payment-steps',
  'Порядок оформления заказа',
  `<ol class="transport-services__schedule-list transport-services__schedule-list--ordered">${steps}</ol>`,
)}
${sectionHtml(
  'shop-payment-security',
  'Безопасность платежей',
  `<p class="transport-services__vehicle-desc">Оплата банковской картой в сервисе bePaid полностью конфиденциальна и безопасна. Доступ к реквизитам банковской карты покупателя осуществляется по протоколу TLS, применяется технология 3-D Secure. bePaid соответствует международному стандарту безопасности PCI DSS.</p>
<p class="transport-services__vehicle-desc">Реквизиты карты вводятся на защищённой платёжной странице bePaid; интернет-магазин не получает и не хранит данные банковской карты.</p>
<p class="transport-services__vehicle-desc">После совершения оплаты сохраняйте подтверждение об оплате (карт-чек, e-mail) для сверки с выпиской по карте в случае спорных ситуаций.</p>
<p class="transport-services__vehicle-desc">Если Вы не получили заказ, обратитесь в службу поддержки продавца по телефону <a href="${SHOP_SUPPORT_PHONE_HREF}">${escapeHtml(SHOP_SUPPORT_PHONE)}</a> или e-mail <a href="mailto:${SHOP_SUPPORT_EMAIL}">${escapeHtml(SHOP_SUPPORT_EMAIL)}</a>.</p>
<p class="transport-services__vehicle-desc">При оплате банковской платёжной картой возврат денежных средств осуществляется на карту, с которой была произведена оплата, в сроки, установленные банком-эмитентом.</p>
<p class="transport-services__vehicle-desc">Подробнее об оплате для покупателей: <a href="${BEPAID_PAYMENT_INFO_URL}" target="_blank" rel="noopener noreferrer">${BEPAID_PAYMENT_INFO_URL}</a>.</p>`,
)}
${sectionHtml(
  'shop-payment-receipt',
  'Подтверждение оплаты',
  `<p class="transport-services__vehicle-desc">После успешной оплаты на указанный при оформлении e-mail направляется электронное подтверждение заказа и операции оплаты.</p>`,
)}
<p class="transport-services__phone transport-services__phone--footer"><a href="/shop/catalog">Перейти в каталог</a> · <a href="/shop/cart">Корзина</a></p>`);
}

export function shopReturnsPageHtml(): string {
  return wrapCmsPageContent(`<p class="transport-services__lead">Настоящие правила распространяются на товары, приобретённые в интернет-магазине ФК «Динамо-Брест», в порядке, установленном законодательством Республики Беларусь о защите прав потребителей.</p>
${sectionHtml(
  'shop-returns-cancel',
  'Отмена заказа',
  `<p class="transport-services__vehicle-desc">До передачи заказа в службу доставки покупатель вправе отменить заказ, обратившись по телефону <a href="${SHOP_SUPPORT_PHONE_HREF}">${escapeHtml(SHOP_SUPPORT_PHONE)}</a> или на e-mail <a href="mailto:${SHOP_SUPPORT_EMAIL}">${escapeHtml(SHOP_SUPPORT_EMAIL)}</a>. Если оплата уже произведена банковской картой, возврат денежных средств осуществляется на карту, с которой была произведена оплата, в сроки, установленные банком-эмитентом.</p>
<p class="transport-services__vehicle-desc">После передачи заказа на отправку отмена возможна только в случаях, предусмотренных законодательством.</p>`,
)}
${sectionHtml(
  'shop-returns-quality',
  'Возврат качественного товара',
  `<p class="transport-services__vehicle-desc">Товары надлежащего качества, относящиеся к категории непродовольственных товаров, реализуемых в интернет-магазине, подлежат обмену и возврату в случаях и в сроки, предусмотренные Законом Республики Беларусь от 9 января 2002 г. № 90-З «О защите прав потребителей» и иными нормативными правовыми актами.</p>
<p class="transport-services__vehicle-desc">Товары с индивидуально-определёнными свойствами (в том числе с нанесением имени, номера или иной персонализации), изготовленные по заказу покупателя, возврату и обмену не подлежат, если иное не согласовано с продавцом.</p>`,
)}
${sectionHtml(
  'shop-returns-defect',
  'Возврат некачественного товара',
  `<p class="transport-services__vehicle-desc">При обнаружении недостатков товара покупатель вправе предъявить продавцу требования, предусмотренные законодательством: замена товара, соразмерное уменьшение цены, безвозмездное устранение недостатков, возврат уплаченной суммы.</p>
<p class="transport-services__vehicle-desc">Для оформления возврата или обмена обратитесь по телефону <a href="${SHOP_SUPPORT_PHONE_HREF}">${escapeHtml(SHOP_SUPPORT_PHONE)}</a> или на <a href="mailto:${SHOP_SUPPORT_EMAIL}">${escapeHtml(SHOP_SUPPORT_EMAIL)}</a>. Сохраняйте подтверждение оплаты (карт-чек) и документы, подтверждающие покупку.</p>`,
)}
<p class="transport-services__phone transport-services__phone--footer">Телефон: <a href="${SHOP_SUPPORT_PHONE_HREF}">${escapeHtml(SHOP_SUPPORT_PHONE)}</a> · E-mail: <a href="mailto:${SHOP_SUPPORT_EMAIL}">${escapeHtml(SHOP_SUPPORT_EMAIL)}</a></p>`);
}

export function fansPageHtml(): string {
  return wrapCmsPageContent(`<p class="transport-services__lead">«УТВЕРЖДЕНО» — Заседание бюро Исполкома АБФФ, протокол № 31 от 22.04.2025 г.</p>
<h2 class="transport-services__vehicle-title">Правила поведения болельщиков на стадионе во время проведения футбольных матчей</h2>
<p class="transport-services__vehicle-desc">Настоящие Правила подготовлены на основании закона «О физической культуре и спорте», Правил безопасности проведения занятий физической культурой и спортом и регламентирующих документов ФИФА, УЕФА и АБФФ.</p>
<h3 class="transport-services__subsection-title">1. Общее положение</h3>
<p class="transport-services__vehicle-desc">1.1. Болельщиками признаются граждане, находящиеся до, во время и после футбольного матча на стадионе при наличии входного билета, абонемента, приглашения или других документов установленного образца.</p>
<p class="transport-services__vehicle-desc">1.2. Вход на стадион подразумевает принятие и добровольное исполнение болельщиками данных Правил.</p>
<p class="transport-services__vehicle-desc">1.3. Организатор матча в целях обеспечения безопасного проведения может вводить условия посещения, не противоречащие законодательству.</p>
<p class="transport-services__vehicle-desc">1.4. Все спортивные объекты оборудованы стационарной системой видеонаблюдения.</p>
<p class="transport-services__vehicle-desc">1.5. Болельщики, не соблюдающие настоящие Правила, не допускаются на стадион или выдворяются без возмещения стоимости билета.</p>
<p class="transport-services__vehicle-desc">1.6. Контроль за соблюдением Правил осуществляют организатор матча, правоохранительные органы, МЧС и служба безопасности стадиона.</p>
<h3 class="transport-services__subsection-title">2. Болельщики имеют право</h3>
<p class="transport-services__vehicle-desc">2.1–2.10. Входить на стадион по билетам и абонементам; получать информацию о порядке посещения; пользоваться услугами стадиона; использовать разрешённую атрибутику и средства поддержки команды в установленном порядке.</p>
<h3 class="transport-services__subsection-title">3. Болельщики обязаны</h3>
<p class="transport-services__vehicle-desc">3.1–3.10. Предъявлять документы на вход; проходить досмотр; занимать места по билетам; соблюдать общественный порядок; уважать символику и других болельщиков; сообщать о подозрительных предметах; следовать указаниям при эвакуации; бережно относиться к имуществу стадиона.</p>
<h3 class="transport-services__subsection-title">4. Болельщикам запрещается</h3>
<p class="transport-services__vehicle-desc">4.1. Находиться на стадионе в состоянии алкогольного или наркотического опьянения.</p>
<p class="transport-services__vehicle-desc">4.2. Проносить запрещённые предметы: оружие, пиротехнику, лазеры, крупногабаритные вещи, профессиональную фото-/видеотехнику, музыкальные инструменты и др.</p>
<p class="transport-services__vehicle-desc">4.3–4.18. Курить в запрещённых местах; бросать предметы; использовать нецензурную брань и символику нацистского характера; выходить на поле; торговать без разрешения; нарушать общественный порядок и иные действия, угрожающие безопасности.</p>
<p class="transport-services__phone transport-services__phone--footer">Полный текст правил — на официальном сайте АБФФ.</p>`);
}

export const CMS_PAGE_HTML_BY_SLUG: Record<string, () => string> = {
  'services-transport': transportPageHtml,
  'services-fields': fieldsPageHtml,
  'services-cafe': cafePageHtml,
  'services-hotel': hotelPageHtml,
  'services-gym': gymPageHtml,
  'school-about': () => placeholderHtml('Информация о футбольной школе будет добавлена в админ-панели.'),
  'school-join': () => placeholderHtml('Информация о наборе в школу будет добавлена в админ-панели.'),
  'school-tournaments': () => placeholderHtml('Информация о турнирах будет добавлена в админ-панели.'),
  'school-teams': () => placeholderHtml('Информация о командах школы будет добавлена в админ-панели.'),
  'fans-supporters': fansPageHtml,
  'shop-delivery': shopDeliveryPageHtml,
  'shop-payment': shopPaymentPageHtml,
  'shop-returns': shopReturnsPageHtml,
  'club-partners': clubPartnersPageHtml,
  'club-stadium': clubStadiumPageHtml,
  'media-press': mediaPressPageHtml,
  'media-anthems': mediaAnthemsPageHtml,
};
