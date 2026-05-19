-- CreateTable
CREATE TABLE `sitePageMeta` (
    `id` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'static',
    `title` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `redirectTo` VARCHAR(191) NULL,
    `visitCount` INTEGER NOT NULL DEFAULT 0,
    `defaultTitle` VARCHAR(500) NULL,
    `defaultDescription` TEXT NULL,
    `isTemplate` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sitePageMeta_path_key`(`path`),
    INDEX `sitePageMeta_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
