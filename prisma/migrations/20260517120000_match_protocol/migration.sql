-- CreateTable
CREATE TABLE `matchLineup` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `personCometId` VARCHAR(191) NOT NULL,
    `personName` VARCHAR(191) NOT NULL,
    `teamCometId` INTEGER NULL,
    `shirtNumber` INTEGER NULL,
    `startingLineup` BOOLEAN NOT NULL DEFAULT false,
    `played` BOOLEAN NOT NULL DEFAULT false,
    `goals` INTEGER NOT NULL DEFAULT 0,
    `yellowCards` INTEGER NOT NULL DEFAULT 0,
    `redCards` INTEGER NOT NULL DEFAULT 0,
    `minutesPlayed` INTEGER NULL,
    `playerId` VARCHAR(191) NULL,

    UNIQUE INDEX `matchLineup_matchId_personCometId_key`(`matchId`, `personCometId`),
    INDEX `matchLineup_matchId_idx`(`matchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matchEvent` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `personCometId` VARCHAR(191) NULL,
    `personName` VARCHAR(191) NULL,
    `teamCometId` INTEGER NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `eventSubType` VARCHAR(191) NULL,
    `minute` INTEGER NULL,
    `displayMinute` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `matchEvent_matchId_idx`(`matchId`),
    INDEX `matchEvent_matchId_eventType_idx`(`matchId`, `eventType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `matchLineup` ADD CONSTRAINT `matchLineup_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matchLineup` ADD CONSTRAINT `matchLineup_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matchEvent` ADD CONSTRAINT `matchEvent_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
