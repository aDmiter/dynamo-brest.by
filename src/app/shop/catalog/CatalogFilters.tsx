// src/app/shop/catalog/CatalogFilters.tsx
'use client';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  current: string;
  total: number;
  visible: number;
  categoryCounts: Record<string, number>;
  onChange: (id: string) => void;
}

export default function CatalogFilters({
  categories,
  current,
  total,
  visible,
  categoryCounts,
  onChange,
}: Props) {
  const allFilters = [{ id: 'ALL', name: 'Все товары' }, ...categories];

  return (
    <div className="shop-catalog__filters" id="products">
      <div className="shop-catalog__filters-inner">
        <div className="shop-catalog__filters-list">
          {allFilters.map((cat) => {
            const active = current === cat.id;
            const count = cat.id === 'ALL' ? total : (categoryCounts[cat.id] ?? 0);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange(cat.id)}
                className={`shop-catalog__filter${active ? ' shop-catalog__filter--active' : ''}`}
              >
                {cat.name}
                <span className="shop-catalog__filter-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="shop-catalog__filters-summary">{visible} товаров</div>
      </div>
    </div>
  );
}
