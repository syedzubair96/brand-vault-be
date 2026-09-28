-- AlterTable
ALTER TABLE "AssetFolder" ALTER COLUMN "HeadFolderId" DROP NOT NULL;

-- Replace the old placeholder values with NULL
UPDATE "AssetFolder" SET "HeadFolderId" = NULL WHERE "HeadFolderId" = 0;
UPDATE "AssetFolder" SET "deletedAt" = NULL WHERE "deletedAt" = '1970-01-01 00:00:00';
