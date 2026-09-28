/*
  Warnings:

  - Added the required column `createdBy` to the `Assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assets" ADD COLUMN     "FolderId" INTEGER,
ADD COLUMN     "createdBy" INTEGER NOT NULL;
