-- CreateTable
CREATE TABLE "PlatformConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT,
    "username" TEXT,
    "encryptedCredentials" TEXT,
    "webhookSecret" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "connectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlatformConnection_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectionId" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "amount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "PlatformConnection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "telegramBotId" TEXT,
    "encryptedToken" TEXT NOT NULL,
    "webhookSecret" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "connectedAt" DATETIME,
    "platformConnectionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bot_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bot_platformConnectionId_fkey" FOREIGN KEY ("platformConnectionId") REFERENCES "PlatformConnection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Bot" ("connectedAt", "createdAt", "encryptedToken", "id", "merchantId", "name", "status", "telegramBotId", "updatedAt", "username", "webhookSecret") SELECT "connectedAt", "createdAt", "encryptedToken", "id", "merchantId", "name", "status", "telegramBotId", "updatedAt", "username", "webhookSecret" FROM "Bot";
DROP TABLE "Bot";
ALTER TABLE "new_Bot" RENAME TO "Bot";
CREATE UNIQUE INDEX "Bot_username_key" ON "Bot"("username");
CREATE UNIQUE INDEX "Bot_telegramBotId_key" ON "Bot"("telegramBotId");
CREATE UNIQUE INDEX "Bot_platformConnectionId_key" ON "Bot"("platformConnectionId");
CREATE INDEX "Bot_merchantId_idx" ON "Bot"("merchantId");
CREATE INDEX "Bot_status_idx" ON "Bot"("status");
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "botId" TEXT,
    "platformConnectionId" TEXT,
    "customerId" TEXT,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "paymentStatus" TEXT NOT NULL DEFAULT 'Belum Dibayar',
    "total" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_platformConnectionId_fkey" FOREIGN KEY ("platformConnectionId") REFERENCES "PlatformConnection" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("botId", "createdAt", "customerId", "id", "merchantId", "notes", "orderNumber", "paymentStatus", "status", "total", "updatedAt") SELECT "botId", "createdAt", "customerId", "id", "merchantId", "notes", "orderNumber", "paymentStatus", "status", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_merchantId_idx" ON "Order"("merchantId");
CREATE INDEX "Order_botId_idx" ON "Order"("botId");
CREATE INDEX "Order_platformConnectionId_idx" ON "Order"("platformConnectionId");
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE UNIQUE INDEX "Order_merchantId_orderNumber_key" ON "Order"("merchantId", "orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PlatformConnection_merchantId_idx" ON "PlatformConnection"("merchantId");

-- CreateIndex
CREATE INDEX "PlatformConnection_platform_status_idx" ON "PlatformConnection"("platform", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConnection_platform_externalId_key" ON "PlatformConnection"("platform", "externalId");

-- CreateIndex
CREATE INDEX "Subscription_connectionId_status_idx" ON "Subscription"("connectionId", "status");

-- CreateIndex
CREATE INDEX "Subscription_endsAt_idx" ON "Subscription"("endsAt");
