-- CreateTable
CREATE TABLE `contentTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `resourceType` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `contentTranslation_resourceType_resourceId_locale_idx`(`resourceType`, `resourceId`, `locale`),
    UNIQUE INDEX `ContentTranslation_resource_field_locale_key`(`resourceType`, `resourceId`, `field`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
