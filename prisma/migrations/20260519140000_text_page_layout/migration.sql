-- AlterTable
ALTER TABLE `menuitem` ADD COLUMN `heroHeader` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `footermenuitem` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `subtitle` VARCHAR(191) NULL,
    ADD COLUMN `heroHeader` BOOLEAN NOT NULL DEFAULT false;
