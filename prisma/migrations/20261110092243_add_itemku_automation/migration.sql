-- CreateTable
CREATE TABLE "ItemkuSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "planKey" TEXT NOT NULL DEFAULT 'STARTER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "amount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "maxProducts" INTEGER NOT NULL DEFAULT 20,
    "maxOrdersPerMonth" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemkuSubscription_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemkuProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "itemkuProductId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "gameName" TEXT,
    "itemTypeName" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minimumOrder" INTEGER NOT NULL DEFAULT 1,
    "baseUnit" INTEGER NOT NULL DEFAULT 1,
    "fulfillmentMode" TEXT NOT NULL DEFAULT 'MANUAL_STOCK',
    "usingDeliveryInfo" BOOLEAN NOT NULL DEFAULT false,
    "deliveryInfoFields" TEXT,
    "digiflazzProductCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemkuProduct_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemkuOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "productId" TEXT,
    "itemkuOrderId" INTEGER NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUIRE_PROCESS',
    "processingStatus" TEXT NOT NULL DEFAULT 'RECEIVED',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "requiredInformation" TEXT,
    "usingDeliveryInfo" BOOLEAN NOT NULL DEFAULT false,
    "deliveryInfoFields" TEXT,
    "rawPayload" TEXT,
    "lastError" TEXT,
    "processedAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemkuOrder_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemkuOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ItemkuProduct" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemkuStock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "encryptedDeliveryInfo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "reservedAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemkuStock_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemkuStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ItemkuProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemkuStock_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ItemkuOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemkuSubscription_merchantId_key" ON "ItemkuSubscription"("merchantId");

-- CreateIndex
CREATE INDEX "ItemkuSubscription_status_endsAt_idx" ON "ItemkuSubscription"("status", "endsAt");

-- CreateIndex
CREATE INDEX "ItemkuProduct_merchantId_isActive_idx" ON "ItemkuProduct"("merchantId", "isActive");

-- CreateIndex
CREATE INDEX "ItemkuProduct_merchantId_fulfillmentMode_idx" ON "ItemkuProduct"("merchantId", "fulfillmentMode");

-- CreateIndex
CREATE UNIQUE INDEX "ItemkuProduct_merchantId_itemkuProductId_key" ON "ItemkuProduct"("merchantId", "itemkuProductId");

-- CreateIndex
CREATE INDEX "ItemkuOrder_merchantId_status_idx" ON "ItemkuOrder"("merchantId", "status");

-- CreateIndex
CREATE INDEX "ItemkuOrder_merchantId_processingStatus_idx" ON "ItemkuOrder"("merchantId", "processingStatus");

-- CreateIndex
CREATE INDEX "ItemkuOrder_productId_idx" ON "ItemkuOrder"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemkuOrder_merchantId_itemkuOrderId_key" ON "ItemkuOrder"("merchantId", "itemkuOrderId");

-- CreateIndex
CREATE INDEX "ItemkuStock_merchantId_status_idx" ON "ItemkuStock"("merchantId", "status");

-- CreateIndex
CREATE INDEX "ItemkuStock_productId_status_idx" ON "ItemkuStock"("productId", "status");

-- CreateIndex
CREATE INDEX "ItemkuStock_orderId_idx" ON "ItemkuStock"("orderId");
