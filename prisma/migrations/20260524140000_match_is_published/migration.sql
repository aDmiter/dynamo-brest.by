ALTER TABLE `match` ADD COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT true;

-- Прошлые матчи со статусом scheduled скрываем с сайта по умолчанию
UPDATE `match`
SET `isPublished` = false
WHERE `status` = 'scheduled'
  AND `matchDate` < UTC_TIMESTAMP()
  AND `matchDate` > '1970-01-02 00:00:00';
