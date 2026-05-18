import MenuPageShell from '@/modules/shared/ui/MenuPageShell';
import { SHOP_HERO_IMAGE } from '@/modules/shop/data/shop-info';

interface ShopInfoPageShellProps {
  title: string;
  children: React.ReactNode;
}

export default function ShopInfoPageShell({ title, children }: ShopInfoPageShellProps) {
  return (
    <MenuPageShell
      title={title}
      subtitle="Интернет-магазин"
      moduleLabel="Магазин"
      imageUrl={SHOP_HERO_IMAGE}
      lightContent
    >
      <div className="transport-services">{children}</div>
    </MenuPageShell>
  );
}
