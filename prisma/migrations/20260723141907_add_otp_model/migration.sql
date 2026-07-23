-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Otp_email_idx" ON "Otp"("email");

-- CreateIndex
CREATE INDEX "Otp_email_verified_idx" ON "Otp"("email", "verified");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Log_statusCode_idx" ON "Log"("statusCode");

-- CreateIndex
CREATE INDEX "Log_method_idx" ON "Log"("method");

-- CreateIndex
CREATE INDEX "Request_createdBy_idx" ON "Request"("createdBy");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "Request_createdAt_idx" ON "Request"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Request_createdBy_createdAt_idx" ON "Request"("createdBy", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
