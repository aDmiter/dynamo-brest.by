-- AlterTable
ALTER TABLE `admin` ADD COLUMN `permissions` JSON NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- Первый администратор (role admin) → суперадмин
UPDATE `admin` SET `role` = 'superadmin' WHERE `role` = 'admin';
