-- Better Auth email/password stores hashed credentials on Account rows.
ALTER TABLE "Account"
ADD COLUMN "password" TEXT;
