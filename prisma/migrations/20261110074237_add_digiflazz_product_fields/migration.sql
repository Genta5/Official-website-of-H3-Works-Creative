-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'Lainnya',
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "providerCode" TEXT,
    "providerPrice" INTEGER,
    "providerBrand" TEXT,
    "providerType" TEXT,
    "providerCategory" TEXT,
    "providerStatus" TEXT,
    "providerLastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("category", "createdAt", "description", "id", "merchantId", "name", "price", "status", "stock", "updatedAt") SELECT "category", "createdAt", "description", "id", "merchantId", "name", "price", "status", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_merchantId_idx" ON "Product"("merchantId");
CREATE INDEX "Product_merchantId_source_idx" ON "Product"("merchantId", "source");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_providerCode_idx" ON "Product"("providerCode");
CREATE UNIQUE INDEX "Product_merchantId_source_providerCode_key" ON "Product"("merchantId", "source", "providerCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
