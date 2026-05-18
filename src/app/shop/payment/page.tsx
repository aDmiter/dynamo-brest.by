import type { Metadata } from 'next';
import Link from 'next/link';
import ShopInfoPageShell from '@/modules/shop/components/ShopInfoPageShell';
import {
  ORDER_STEPS,
  SHOP_SUPPORT_EMAIL,
  SHOP_SUPPORT_PHONE,
  SHOP_SUPPORT_PHONE_HREF,
  WEBPAY_RECEIPT_SAMPLE_URL,
  WEBPAY_SITE_URL,
} from '@/modules/shop/data/shop-info';

export const metadata: Metadata = {
  title: 'Оплата | Интернет-магазин | Динамо-Брест',
  description:
    'Оплата заказов банковской картой через платёжную систему WebPay в интернет-магазине ФК «Динамо-Брест».',
};

export default function ShopPaymentPage() {
  return (
    <ShopInfoPageShell title="Оплата">
      <p className="transport-services__lead">
        Оплата товаров в интернет-магазине ФК «Динамо-Брест» производится в белорусских рублях
        (BYN) банковской платёжной картой через платёжную систему{' '}
        <a href={WEBPAY_SITE_URL} target="_blank" rel="noopener noreferrer">
          WebPay (www.webpay.by)
        </a>
        .
      </p>

      <section className="transport-services__vehicle" aria-labelledby="shop-payment-steps">
        <h2 id="shop-payment-steps" className="transport-services__vehicle-title">
          Порядок оформления заказа
        </h2>
        <ol className="transport-services__schedule-list" style={{ listStyle: 'decimal', paddingLeft: '1.25rem' }}>
          {ORDER_STEPS.map((step) => (
            <li key={step} style={{ marginBottom: '0.5rem' }}>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="transport-services__vehicle" aria-labelledby="shop-payment-security">
        <h2 id="shop-payment-security" className="transport-services__vehicle-title">
          Безопасность платежей
        </h2>
        <p className="transport-services__vehicle-desc">
          Безопасный сервер WEBPAY устанавливает шифрованное соединение по защищённому протоколу TLS
          и конфиденциально принимает от клиента данные его платёжной карты (номер карты, имя
          держателя, дату окончания действия и контрольный номер банковской карточки CVC/CVC2).
        </p>
        <p className="transport-services__vehicle-desc">
          После совершения оплаты с использованием банковской карты необходимо сохранять полученные
          карт-чеки (подтверждения об оплате) для сверки с выпиской из карт-счёта (с целью
          подтверждения совершённых операций в случае возникновения спорных ситуаций).
        </p>
        <p className="transport-services__vehicle-desc">
          В случае, если Вы не получили заказ (не оказана услуга), Вам необходимо обратиться в
          службу технической поддержки по телефону{' '}
          <a href={SHOP_SUPPORT_PHONE_HREF}>{SHOP_SUPPORT_PHONE}</a> или e-mail{' '}
          <a href={`mailto:${SHOP_SUPPORT_EMAIL}`}>{SHOP_SUPPORT_EMAIL}</a>. Менеджеры Вас
          проконсультируют.
        </p>
        <p className="transport-services__vehicle-desc">
          При оплате банковской платёжной картой возврат денежных средств осуществляется на
          карточку, с которой была произведена оплата.
        </p>
      </section>

      <section className="transport-services__vehicle" aria-labelledby="shop-payment-receipt">
        <h2 id="shop-payment-receipt" className="transport-services__vehicle-title">
          Подтверждение оплаты
        </h2>
        <p className="transport-services__vehicle-desc">
          Образец документа, подтверждающего оплату, размещён на сайте WebPay:{' '}
          <a href={WEBPAY_RECEIPT_SAMPLE_URL} target="_blank" rel="noopener noreferrer">
            {WEBPAY_RECEIPT_SAMPLE_URL}
          </a>
          . После успешной оплаты на указанный e-mail также направляется электронное подтверждение
          заказа.
        </p>
      </section>

      <p className="transport-services__phone transport-services__phone--footer">
        <Link href="/shop/catalog">Перейти в каталог</Link>
        {' · '}
        <Link href="/shop/cart">Корзина</Link>
      </p>
    </ShopInfoPageShell>
  );
}
