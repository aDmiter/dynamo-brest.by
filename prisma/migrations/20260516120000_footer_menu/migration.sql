-- CreateTable
CREATE TABLE `footermenuitem` (
    `id` VARCHAR(191) NOT NULL,
    `block` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'page',
    `linkUrl` VARCHAR(191) NULL,
    `pageContent` LONGTEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isExternal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `footermenuitem_slug_key`(`slug`),
    INDEX `footermenuitem_block_order_idx`(`block`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `footercontacts` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'main',
    `title` VARCHAR(191) NOT NULL DEFAULT 'Контакты',
    `email` VARCHAR(191) NOT NULL DEFAULT 'info@dynamo-brest.by',
    `addressLabel` VARCHAR(191) NOT NULL DEFAULT 'Адрес офиса в Бресте',
    `address` VARCHAR(191) NOT NULL DEFAULT 'г. Брест, ул. Гоголя, 9',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
