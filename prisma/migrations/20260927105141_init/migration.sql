-- CreateTable
CREATE TABLE "AssetFolder" (
    "id" SERIAL NOT NULL,
    "FolderName" TEXT NOT NULL,
    "HeadFolderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetFolder_FolderName_key" ON "AssetFolder"("FolderName");
