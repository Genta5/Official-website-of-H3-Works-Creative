const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { PrismaClient } = require("@prisma/client");

const databaseUrl = process.env.ITEMKU_TEST_DATABASE_URL;

if (
  !databaseUrl ||
  !databaseUrl.startsWith("file:/tmp/orderly-itemku-concurrency-")
) {
  throw new Error(
    "STOP: ITEMKU_TEST_DATABASE_URL wajib menunjuk database tes khusus di /tmp."
  );
}

const prisma = new PrismaClient({
  datasourceUrl: databaseUrl,
  log: ["error"],
});

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  module._compile(compiled.outputText, filename);
};

const originalLoad = Module._load;

process.env.ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

let encryptToken;

Module._load = function (request, parent, isMain) {
  if (request === "server-only") return {};
  if (request === "@/lib/prisma") return { prisma };
  if (request === "@/lib/crypto") {
    const cryptoModule = originalLoad.call(
      this,
      path.join(process.cwd(), "lib/crypto.ts"),
      parent,
      isMain
    );
    encryptToken = cryptoModule.encryptToken;
    return cryptoModule;
  }
  return originalLoad.call(this, request, parent, isMain);
};

let reserveItemkuStock;
let markItemkuDeliveryAttempted;
let completeItemkuDelivery;
let prepareItemkuDeliveryInfo;

try {
  ({
    reserveItemkuStock,
    markItemkuDeliveryAttempted,
    completeItemkuDelivery,
      prepareItemkuDeliveryInfo,
  } = require(
    path.join(process.cwd(), "lib/itemku-fulfillment.ts")
  ));
} finally {
  Module._load = originalLoad;
}

async function main() {
  const suffix = `${Date.now()}-${process.pid}`;

  const merchant = await prisma.merchant.create({
    data: {
      id: `test-merchant-${suffix}`,
      name: "Concurrency Test",
      email: `concurrency-${suffix}@example.invalid`,
      passwordHash: "test-only-not-a-real-password",
    },
  });

  const product = await prisma.itemkuProduct.create({
    data: {
      merchantId: merchant.id,
      itemkuProductId: Number(String(Date.now()).slice(-8)),
      name: "Concurrency Test Product",
      fulfillmentMode: "MANUAL_STOCK",
      baseUnit: 1,
      minimumOrder: 1,
      isActive: true,
    },
  });

  const orders = await Promise.all(
    [1, 2].map((number) =>
      prisma.itemkuOrder.create({
        data: {
          merchantId: merchant.id,
          productId: product.id,
          itemkuOrderId: Number(String(Date.now()).slice(-8)) + number,
          orderNumber: `TEST-${suffix}-${number}`,
          productName: product.name,
          quantity: 1,
          price: 100,
          total: 100,
        },
      })
    )
  );

  await prisma.itemkuStock.create({
    data: {
      merchantId: merchant.id,
      productId: product.id,
      encryptedDeliveryInfo: "TEST-ONLY-NOT-REAL-CREDENTIAL",
      status: "AVAILABLE",
    },
  });

  console.log("Menjalankan dua reservasi bersamaan untuk satu stok...");

  const results = await Promise.all([
    reserveItemkuStock(merchant.id, orders[0].id),
    reserveItemkuStock(merchant.id, orders[1].id),
  ]);

  const stocks = await prisma.itemkuStock.findMany({
    where: { merchantId: merchant.id, productId: product.id },
    select: { id: true, status: true, orderId: true },
  });

  const finalOrders = await prisma.itemkuOrder.findMany({
    where: { merchantId: merchant.id, id: { in: orders.map((o) => o.id) } },
    select: { id: true, processingStatus: true, status: true },
  });

  console.log(
    JSON.stringify(
      { results, stocks, orders: finalOrders },
      null,
      2
    )
  );

  const reserved = stocks.filter(
    (stock) => stock.status === "RESERVED"
  );

  if (
    reserved.length !== 1 ||
    !orders.some((order) => order.id === reserved[0].orderId)
  ) {
    throw new Error(
      "GAGAL: invariant reservasi satu stok tidak terpenuhi."
    );
  }

  const winningOrderId = reserved[0].orderId;

  const marked = await markItemkuDeliveryAttempted(
    merchant.id,
    winningOrderId
  );

  if (!marked) {
    throw new Error("GAGAL: penanda delivery tidak berhasil.");
  }

  const completed = await completeItemkuDelivery(
    merchant.id,
    winningOrderId
  );

  if (!completed) {
    throw new Error("GAGAL: penyelesaian delivery database ditolak.");
  }

  const repeatedCompletion = await completeItemkuDelivery(
    merchant.id,
    winningOrderId
  );

  if (repeatedCompletion) {
    throw new Error("GAGAL: penyelesaian order yang sama diterima dua kali.");
  }

  const deliveredStock = await prisma.itemkuStock.findMany({
    where: {
      merchantId: merchant.id,
      productId: product.id,
    },
    select: {
      status: true,
      orderId: true,
      deliveredAt: true,
    },
  });

  const completedOrder = await prisma.itemkuOrder.findUnique({
    where: { id: winningOrderId },
    select: {
      processingStatus: true,
      status: true,
      deliveryAttemptedAt: true,
      deliveredAt: true,
      processedAt: true,
    },
  });

  if (
    deliveredStock.length !== 1 ||
    deliveredStock[0].status !== "DELIVERED" ||
    !deliveredStock[0].deliveredAt ||
    !completedOrder ||
    completedOrder.processingStatus !== "COMPLETED" ||
    completedOrder.status !== "DELIVERED" ||
    !completedOrder.deliveryAttemptedAt ||
    !completedOrder.deliveredAt ||
    !completedOrder.processedAt
  ) {
    throw new Error("GAGAL: hasil akhir database tidak sesuai.");
  }

  const accountProduct = await prisma.itemkuProduct.create({
    data: {
      merchantId: merchant.id,
      itemkuProductId: Number(String(Date.now()).slice(-8)) + 3,
      name: "Payload Account Test",
      fulfillmentMode: "MANUAL_STOCK",
      baseUnit: 1,
      minimumOrder: 1,
      isActive: true,
      usingDeliveryInfo: true,
      deliveryInfoFields: JSON.stringify([
        { field_name: "username" },
        { field_name: "password" },
      ]),
    },
  });

  const accountOrder = await prisma.itemkuOrder.create({
    data: {
      merchantId: merchant.id,
      productId: accountProduct.id,
      itemkuOrderId: Number(String(Date.now()).slice(-8)) + 3,
      orderNumber: `PAYLOAD-ACCOUNT-${suffix}`,
      productName: accountProduct.name,
      status: "REQUIRE_PROCESS",
      processingStatus: "PROCESSING",
      quantity: 2,
      price: 100,
      total: 200,
    },
  });

  const accountPayloads = [
    { username: "test-user-1", password: "test-pass-1" },
    { username: "test-user-2", password: "test-pass-2" },
  ];

  await prisma.itemkuStock.createMany({
    data: accountPayloads.map((payload) => ({
      merchantId: merchant.id,
      productId: accountProduct.id,
      orderId: accountOrder.id,
      encryptedDeliveryInfo: encryptToken(JSON.stringify(payload)),
      status: "RESERVED",
    })),
  });

  const accountResult = await prepareItemkuDeliveryInfo(
    merchant.id,
    accountOrder.id
  );

  if (
    !accountResult.success ||
    JSON.stringify(accountResult.deliveryInfo) !==
      JSON.stringify(accountPayloads)
  ) {
    throw new Error("GAGAL: payload akun tidak sesuai konfigurasi field.");
  }

  console.log("LULUS: payload akun berhasil didekripsi dan divalidasi.");

  const voucherProduct = await prisma.itemkuProduct.create({
    data: {
      merchantId: merchant.id,
      itemkuProductId: Number(String(Date.now()).slice(-8)) + 4,
      name: "Payload Voucher Test",
      fulfillmentMode: "MANUAL_STOCK",
      baseUnit: 1,
      minimumOrder: 1,
      isActive: true,
      usingDeliveryInfo: true,
      deliveryInfoFields: null,
    },
  });

  const voucherOrder = await prisma.itemkuOrder.create({
    data: {
      merchantId: merchant.id,
      productId: voucherProduct.id,
      itemkuOrderId: Number(String(Date.now()).slice(-8)) + 4,
      orderNumber: `PAYLOAD-VOUCHER-${suffix}`,
      productName: voucherProduct.name,
      status: "REQUIRE_PROCESS",
      processingStatus: "PROCESSING",
      quantity: 2,
      price: 100,
      total: 200,
    },
  });

  const voucherPayloads = ["TEST-VOUCHER-001", "TEST-VOUCHER-002"];

  await prisma.itemkuStock.createMany({
    data: voucherPayloads.map((payload) => ({
      merchantId: merchant.id,
      productId: voucherProduct.id,
      orderId: voucherOrder.id,
      encryptedDeliveryInfo: encryptToken(payload),
      status: "RESERVED",
    })),
  });

  const voucherResult = await prepareItemkuDeliveryInfo(
    merchant.id,
    voucherOrder.id
  );

  if (
    !voucherResult.success ||
    JSON.stringify(voucherResult.deliveryInfo) !==
      JSON.stringify(voucherPayloads)
  ) {
    throw new Error("GAGAL: payload voucher tidak sesuai hasil yang diharapkan.");
  }

  console.log("LULUS: payload voucher berhasil didekripsi dan divalidasi.");

  console.log("LULUS: satu stok hanya terhubung ke satu order.");
  console.log("LULUS: order dan stok berhasil diselesaikan.");
  console.log("LULUS: penyelesaian kedua ditolak.");
  console.log("Tidak ada API Itemku atau proses delivery yang dipanggil.");
}

main()
  .catch((error) => {
    console.error("TEST GAGAL:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
