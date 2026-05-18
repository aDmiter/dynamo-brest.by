import type { Metadata } from 'next';
import ShopInfoPageShell from '@/modules/shop/components/ShopInfoPageShell';
import { SHOP_POSTAL_ADDRESS } from '@/modules/shop/data/shop-info';

export const metadata: Metadata = {
  title: 'Доставка | Интернет-магазин | Динамо-Брест',
  description:
    'Доставка товаров интернет-магазина ФК «Динамо-Брест» по Республике Беларусь и за рубеж через РУП «Белпочта» (EMS).',
};

export default function ShopDeliveryPage() {
  return (
    <ShopInfoPageShell title="Доставка">
      <p className="transport-services__lead">
        Доставка заказов интернет-магазина ФК «Динамо-Брест» осуществляется по адресу, указанному
        покупателем при оформлении заказа.
      </p>

      <section className="transport-services__vehicle" aria-labelledby="shop-delivery-belpost">
        <h2 id="shop-delivery-belpost" className="transport-services__vehicle-title">
          РУП «Белпочта»
        </h2>
        <p className="transport-services__vehicle-desc">
          Отправление заказов по Республике Беларусь и в другие страны выполняется РУП «Белпочта»
          экспресс-посылкой EMS в соответствии с действующими тарифами и правилами оператора
          почтовой связи. Стоимость доставки рассчитывается при оформлении заказа в зависимости от
          выбранной страны назначения.
        </p>
        <p className="transport-services__vehicle-desc">
          Сроки доставки зависят от региона получателя и устанавливаются «Белпочтой» для услуги EMS.
          После отправления заказа на указанный при оформлении e-mail направляется уведомление с
          информацией для отслеживания отправления.
        </p>
      </section>

      <section className="transport-services__vehicle" aria-labelledby="shop-delivery-order">
        <h2 id="shop-delivery-order" className="transport-services__vehicle-title">
          После оплаты
        </h2>
        <p className="transport-services__vehicle-desc">
          После успешной оплаты банковской картой через WebPay заказ передаётся на комплектацию и
          отправку. Доставка осуществляется только после подтверждения оплаты.
        </p>
      </section>

      <p className="transport-services__phone transport-services__phone--footer">
        Почтовый адрес продавца: {SHOP_POSTAL_ADDRESS}
      </p>
    </ShopInfoPageShell>
  );
}
