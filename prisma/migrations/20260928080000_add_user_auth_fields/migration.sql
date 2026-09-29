-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "Password" TEXT NOT NULL,
ADD COLUMN     "RefreshTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
