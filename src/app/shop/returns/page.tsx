import type { Metadata } from 'next';
import ShopInfoPageShell from '@/modules/shop/components/ShopInfoPageShell';
import {
  SHOP_SUPPORT_EMAIL,
  SHOP_SUPPORT_PHONE,
  SHOP_SUPPORT_PHONE_HREF,
} from '@/modules/shop/data/shop-info';

export const metadata: Metadata = {
  title: 'Возврат товара | Интернет-магазин | Динамо-Брест',
  description:
    'Условия отмены заказа и возврата товара в интернет-магазине ФК «Динамо-Брест».',
};

export default function ShopReturnsPage() {
  return (
    <ShopInfoPageShell title="Возврат товара">
      <p className="transport-services__lead">
        Настоящие правила распространяются на товары, приобретённые в интернет-магазине ФК
        «Динамо-Брест», в порядке, установленном законодательством Республики Беларусь о защите
        прав потребителей.
      </p>

      <section className="transport-services__vehicle" aria-labelledby="shop-returns-cancel">
        <h2 id="shop-returns-cancel" className="transport-services__vehicle-title">
          Отмена заказа
        </h2>
        <p className="transport-services__vehicle-desc">
          До передачи заказа в службу доставки покупатель вправе отменить заказ, обратившись по
          телефону{' '}
          <a href={SHOP_SUPPORT_PHONE_HREF}>{SHOP_SUPPORT_PHONE}</a> или на e-mail{' '}
          <a href={`mailto:${SHOP_SUPPORT_EMAIL}`}>{SHOP_SUPPORT_EMAIL}</a>. Если оплата уже
          произведена банковской картой, возврат денежных средств осуществляется на карту, с
          которой была произведена оплата, в сроки, установленные банком-эмитентом.
        </p>
        <p className="transport-services__vehicle-desc">
          После передачи заказа на отправку отмена возможна только в случаях, предусмотренных
          законодательством.
        </p>
      </section>

      <section className="transport-services__vehicle" aria-labelledby="shop-returns-quality">
        <h2 id="shop-returns-quality" className="transport-services__vehicle-title">
          Возврат качественного товара
        </h2>
        <p className="transport-services__vehicle-desc">
          Товары надлежащего качества, относящиеся к категории непродовольственных товаров,
          реализуемых в интернет-магазине, подлежат обмену и возврату в случаях и в сроки,
          предусмотренные Законом Республики Беларусь от 9 января 2002 г. № 90-З «О защите прав
          потребителей» и иными нормативными правовыми актами.
        </p>
        <p className="transport-services__vehicle-desc">
          Товары с индивидуально-определёнными свойствами (в том числе с нанесением имени, номера
          или иной персонализации), изготовленные по заказу покупателя, возврату и обмену не
          подлежат, если иное не согласовано с продавцом.
        </p>
      </section>

      <section className="transport-services__vehicle" aria-labelledby="shop-returns-defect">
        <h2 id="shop-returns-defect" className="transport-services__vehicle-title">
          Возврат некачественного товара
        </h2>
        <p className="transport-services__vehicle-desc">
          При обнаружении недостатков товара покупатель вправе предъявить продавцу требования,
          предусмотренные законодательством: замена товара, соразмерное уменьшение цены, безвозмездное
          устранение недостатков, возврат уплаченной суммы.
        </p>
        <p className="transport-services__vehicle-desc">
          Для оформления возврата или обмена обратитесь по телефону{' '}
          <a href={SHOP_SUPPORT_PHONE_HREF}>{SHOP_SUPPORT_PHONE}</a> или на{' '}
          <a href={`mailto:${SHOP_SUPPORT_EMAIL}`}>{SHOP_SUPPORT_EMAIL}</a>. Сохраняйте
          подтверждение оплаты (карт-чек) и документы, подтверждающие покупку.
        </p>
      </section>

      <p className="transport-services__phone transport-services__phone--footer">
        Телефон: <a href={SHOP_SUPPORT_PHONE_HREF}>{SHOP_SUPPORT_PHONE}</a>
        {' · '}
        E-mail: <a href={`mailto:${SHOP_SUPPORT_EMAIL}`}>{SHOP_SUPPORT_EMAIL}</a>
      </p>
    </ShopInfoPageShell>
  );
}
