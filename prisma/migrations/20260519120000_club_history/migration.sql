-- CreateTable
CREATE TABLE `clubHistoryIntro` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'main',
    `contentHtml` LONGTEXT NOT NULL,
    `coverUrl` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clubHistoryYear` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `highlight` BOOLEAN NOT NULL DEFAULT false,
    `contentHtml` LONGTEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `clubHistoryYear_sortOrder_idx`(`sortOrder`),
    INDEX `clubHistoryYear_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clubHistoryYearImage` (
    `id` VARCHAR(191) NOT NULL,
    `yearId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `clubHistoryYearImage_yearId_sortOrder_idx`(`yearId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clubHistoryYearImage` ADD CONSTRAINT `clubHistoryYearImage_yearId_fkey` FOREIGN KEY (`yearId`) REFERENCES `clubHistoryYear`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
