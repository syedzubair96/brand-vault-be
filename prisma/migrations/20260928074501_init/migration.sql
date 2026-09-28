/*
  Warnings:

  - Made the column `FolderId` on table `Assets` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Assets" ALTER COLUMN "FolderId" SET NOT NULL;
