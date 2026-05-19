-- AlterTable
ALTER TABLE `news` ADD COLUMN `createdByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `updatedByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `createdByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `productcategory` ADD COLUMN `createdByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `clubHistoryIntro` ADD COLUMN `updatedByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `clubHistoryYear` ADD COLUMN `createdByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;
