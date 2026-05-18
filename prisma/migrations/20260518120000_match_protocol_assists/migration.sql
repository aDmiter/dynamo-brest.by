-- AlterTable
ALTER TABLE `matchLineup` ADD COLUMN `assists` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `matchEvent` ADD COLUMN `relatedPersonCometId` VARCHAR(191) NULL,
    ADD COLUMN `relatedPersonName` VARCHAR(191) NULL;
