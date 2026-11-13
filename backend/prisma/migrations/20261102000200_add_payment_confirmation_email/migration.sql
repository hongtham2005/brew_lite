ALTER TABLE "Payment"
  ADD COLUMN "confirmationEmailSentAt" TIMESTAMP(3),
  ADD COLUMN "confirmationEmailSendingAt" TIMESTAMP(3);
