-- AlterTable
ALTER TABLE "AssetFolder" ALTER COLUMN "deletedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Assets" ALTER COLUMN "deletedAt" DROP NOT NULL;
