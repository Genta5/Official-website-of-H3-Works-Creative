-- CreateTable
CREATE TABLE "StoreWebsite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "themeKey" TEXT NOT NULL DEFAULT 'minimal',
    "globalSettings" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedVersion" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreWebsite_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StorePage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "isHome" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StorePage_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "StoreWebsite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "StorePage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreRevision_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "StoreWebsite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreWebsite_merchantId_key" ON "StoreWebsite"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreWebsite_slug_key" ON "StoreWebsite"("slug");

-- CreateIndex
CREATE INDEX "StoreWebsite_status_idx" ON "StoreWebsite"("status");

-- CreateIndex
CREATE INDEX "StorePage_websiteId_sortOrder_idx" ON "StorePage"("websiteId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "StorePage_websiteId_path_key" ON "StorePage"("websiteId", "path");

-- CreateIndex
CREATE INDEX "StoreSection_pageId_sortOrder_idx" ON "StoreSection"("pageId", "sortOrder");

-- CreateIndex
CREATE INDEX "StoreRevision_websiteId_createdAt_idx" ON "StoreRevision"("websiteId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StoreRevision_websiteId_version_key" ON "StoreRevision"("websiteId", "version");
