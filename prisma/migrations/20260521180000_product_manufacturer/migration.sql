-- CreateTable
CREATE TABLE `productmanufacturer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `manufacturerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Product_manufacturerId_idx` ON `product`(`manufacturerId`);

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `Product_manufacturerId_fkey` FOREIGN KEY (`manufacturerId`) REFERENCES `productmanufacturer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
