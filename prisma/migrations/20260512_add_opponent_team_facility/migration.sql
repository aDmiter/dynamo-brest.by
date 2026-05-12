-- AlterTable
ALTER TABLE `match` ADD COLUMN `attendance` INTEGER NULL,
    ADD COLUMN `awayTeamId` INTEGER NULL,
    ADD COLUMN `facilityId` INTEGER NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `homeTeamId` INTEGER NULL,
    ADD COLUMN `matchType` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `OpponentTeam` (
    `id` VARCHAR(191) NOT NULL,
    `cometId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `shortName` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OpponentTeam_cometId_key`(`cometId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Facility` (
    `id` VARCHAR(191) NOT NULL,
    `cometId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `shortName` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `lat` DOUBLE NULL,
    `lng` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Facility_cometId_key`(`cometId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `match_homeTeamId_idx` ON `match`(`homeTeamId`);

-- CreateIndex
CREATE INDEX `match_awayTeamId_idx` ON `match`(`awayTeamId`);

-- AddForeignKey
ALTER TABLE `match` ADD CONSTRAINT `match_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `Facility`(`cometId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match` ADD CONSTRAINT `match_homeTeamId_fkey` FOREIGN KEY (`homeTeamId`) REFERENCES `OpponentTeam`(`cometId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match` ADD CONSTRAINT `match_awayTeamId_fkey` FOREIGN KEY (`awayTeamId`) REFERENCES `OpponentTeam`(`cometId`) ON DELETE SET NULL ON UPDATE CASCADE;

