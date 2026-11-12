-- AlterTable
ALTER TABLE "PlatformConnection" ADD COLUMN "discordPublicKey" TEXT;

-- CreateTable
CREATE TABLE "DiscordGuild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platformConnectionId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'connected',
    "orderChannelId" TEXT,
    "notificationChannelId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiscordGuild_platformConnectionId_fkey" FOREIGN KEY ("platformConnectionId") REFERENCES "PlatformConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DiscordGuild_guildId_idx" ON "DiscordGuild"("guildId");

-- CreateIndex
CREATE INDEX "DiscordGuild_platformConnectionId_status_idx" ON "DiscordGuild"("platformConnectionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordGuild_platformConnectionId_guildId_key" ON "DiscordGuild"("platformConnectionId", "guildId");
