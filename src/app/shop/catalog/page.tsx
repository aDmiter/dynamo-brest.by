// src/app/shop/catalog/page.tsx - Каталог товаров
import PagePlaceholder from '@/modules/shared/ui/PagePlaceholder';
import { faShirt } from '@fortawesome/free-solid-svg-icons';

export default function CatalogPage() {
  return (
    <PagePlaceholder
      title="Каталог товаров"
      description="Официальная атрибутика и товары ФК «Динамо-Брест»"
      icon={faShirt}
    />
  );
}
