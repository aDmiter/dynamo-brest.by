-- Порядок вывода товаров в каталоге (отдельно внутри групп «Хит» и остальные)
ALTER TABLE `product` ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

CREATE INDEX `product_isHit_sortOrder_idx` ON `product`(`isHit`, `sortOrder`);
