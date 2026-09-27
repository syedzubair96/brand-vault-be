/*
  Warnings:

  - Made the column `PrimaryColor` on table `BrandKit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BrandKit" ALTER COLUMN "PrimaryColor" SET NOT NULL,
ALTER COLUMN "LogoURL" SET DATA TYPE TEXT;
