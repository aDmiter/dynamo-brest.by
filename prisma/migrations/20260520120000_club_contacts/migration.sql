-- CreateTable
CREATE TABLE `clubContactsPage` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'main',
    `title` VARCHAR(191) NOT NULL DEFAULT 'Контакты',
    `subtitle` VARCHAR(191) NULL DEFAULT 'Клуб',
    `lead` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clubContactSection` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `legalName` TEXT NOT NULL,
    `address` TEXT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `clubContactSection_slug_key`(`slug`),
    INDEX `clubContactSection_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clubContactPhone` (
    `id` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `display` VARCHAR(191) NOT NULL,
    `href` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `clubContactPhone_sectionId_sortOrder_idx`(`sectionId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clubContactStaff` (
    `id` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `phoneHref` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `clubContactStaff_sectionId_sortOrder_idx`(`sectionId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clubContactPhone` ADD CONSTRAINT `clubContactPhone_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `clubContactSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clubContactStaff` ADD CONSTRAINT `clubContactStaff_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `clubContactSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
