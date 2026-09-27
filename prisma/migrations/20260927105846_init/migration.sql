/*
  Warnings:

  - Added the required column `createdBy` to the `AssetFolder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `BrandKit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetFolder" ADD COLUMN     "createdBy" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BrandKit" ADD COLUMN     "createdBy" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "UserName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "LogoURL" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT,
    "description" TEXT,
    "usage_suggestion" TEXT,

    CONSTRAINT "Assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_UserName_key" ON "Users"("UserName");

-- CreateIndex
CREATE UNIQUE INDEX "Assets_name_key" ON "Assets"("name");
