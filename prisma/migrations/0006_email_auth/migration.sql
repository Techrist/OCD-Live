-- Connexion par e-mail : adresse sur le compte, et codes à usage unique rattachés à un identifiant (e-mail) au lieu d'un numéro.
ALTER TABLE "User" ADD COLUMN "email" TEXT;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

ALTER TABLE "OtpCode" RENAME COLUMN "phone" TO "identifier";
ALTER INDEX "OtpCode_phone_idx" RENAME TO "OtpCode_identifier_idx";
-- Les codes en cours (numéros de téléphone) n'ont plus de sens.
DELETE FROM "OtpCode";
