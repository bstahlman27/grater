-- CreateTable
CREATE TABLE "SavedGameItem" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedGameItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedGameItem_gameId_idx" ON "SavedGameItem"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedGameItem_profileId_gameId_key" ON "SavedGameItem"("profileId", "gameId");

-- AddForeignKey
ALTER TABLE "SavedGameItem" ADD CONSTRAINT "SavedGameItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedGameItem" ADD CONSTRAINT "SavedGameItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill saved libraries from games users already touched.
INSERT INTO "SavedGameItem" ("id", "profileId", "gameId")
SELECT gen_random_uuid(), "profileId", "gameId"
FROM (
    SELECT "profileId", "gameId" FROM "Review"
    UNION
    SELECT "profileId", "gameId" FROM "PlayLaterItem"
    UNION
    SELECT "profileId", "gameId" FROM "InstalledGameItem"
) AS touched_games
ON CONFLICT ("profileId", "gameId") DO NOTHING;
