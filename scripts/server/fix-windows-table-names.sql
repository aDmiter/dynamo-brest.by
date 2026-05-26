-- Имена таблиц из XAMPP (Windows) → как ожидает Prisma на Linux
-- Запуск: docker exec -i dynamo-mysql mysql -udynamo -p... dynamo_brest < fix-windows-table-names.sql

RENAME TABLE playerteam TO PlayerTeam;
RENAME TABLE coachteam TO CoachTeam;
RENAME TABLE opponentteam TO OpponentTeam;
RENAME TABLE matchlineup TO matchLineup;
RENAME TABLE matchevent TO matchEvent;
RENAME TABLE country TO Country;
RENAME TABLE productsize TO ProductSize;
RENAME TABLE customization TO Customization;
RENAME TABLE playercustomization TO PlayerCustomization;
RENAME TABLE facility TO Facility;
RENAME TABLE setting TO Setting;
RENAME TABLE sitepreviewuser TO sitePreviewUser;
RENAME TABLE clubhistoryintro TO clubHistoryIntro;
RENAME TABLE clubhistoryyear TO clubHistoryYear;
RENAME TABLE clubhistoryyearimage TO clubHistoryYearImage;
RENAME TABLE clubcontactspage TO clubContactsPage;
RENAME TABLE clubcontactsection TO clubContactSection;
RENAME TABLE clubcontactphone TO clubContactPhone;
RENAME TABLE clubcontactstaff TO clubContactStaff;
RENAME TABLE sitepagemeta TO sitePageMeta;
