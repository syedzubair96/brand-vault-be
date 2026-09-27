-- CreateTable
CREATE TABLE "BrandKit" (
    "id" SERIAL NOT NULL,
    "BrandName" TEXT NOT NULL,
    "PrimaryColor" TEXT,
    "SecondaryColor" TEXT NOT NULL,
    "LogoURL" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandKit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandKit_BrandName_key" ON "BrandKit"("BrandName");
