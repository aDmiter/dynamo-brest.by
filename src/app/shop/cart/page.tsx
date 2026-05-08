// src/app/shop/cart/page.tsx - Корзина
import PagePlaceholder from '@/modules/shared/ui/PagePlaceholder';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';

export default function CartPage() {
  return (
    <PagePlaceholder title="Корзина" description="Ваши выбранные товары" icon={faCartShopping} />
  );
}
