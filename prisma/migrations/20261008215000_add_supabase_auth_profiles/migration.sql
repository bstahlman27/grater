-- Link Grater profiles to Supabase Auth users.
ALTER TABLE "Profile" ADD COLUMN "authUserId" UUID;

CREATE UNIQUE INDEX "Profile_authUserId_key" ON "Profile"("authUserId");
