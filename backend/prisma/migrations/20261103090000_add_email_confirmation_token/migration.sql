ALTER TABLE "Payment"
  ADD COLUMN "confirmationTokenHash" TEXT,
  ADD COLUMN "confirmationTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN "confirmedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Payment_confirmationTokenHash_key"
  ON "Payment"("confirmationTokenHash");
