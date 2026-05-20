-- AlterTable
ALTER TABLE `ProductSize` ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `ProductSize_productId_sortOrder_idx` ON `ProductSize`(`productId`, `sortOrder`);
