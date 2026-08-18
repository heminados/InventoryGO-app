-- AlterTable
ALTER TABLE "User" ADD COLUMN "nfc_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_nfc_token_key" ON "User"("nfc_token");
