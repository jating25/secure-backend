-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "resendCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Otp_createdAt_idx" ON "Otp"("createdAt" DESC);
