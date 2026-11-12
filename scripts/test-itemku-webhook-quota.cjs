const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const routePath = path.join(
  process.cwd(),
  "app/api/itemku/webhook/[connectionId]/route.ts"
);

const future = new Date(Date.now() + 86400000);

let scenario;
let createCalls = 0;
let transactionCalls = 0;
let itemkuRequestCalls = 0;

const fakeOrder = {
  order_id: 987654321,
  order_number: "TEST-QUOTA-001",
  product_id: 12345,
  price: 1000,
  quantity: 1,
  product_name: "Produk Pengujian",
  status: "REQUIRE_PROCESS",
};

const mockPrisma = {
  platformConnection: {
    findFirst: async () => ({
      id: "connection-test",
      merchantId: "merchant-test",
      encryptedCredentials: "encrypted-dummy",
    }),
  },

  itemkuSubscription: {
    findUnique: async () => ({
      status: "ACTIVE",
      startsAt: null,
      endsAt: future,
      maxOrdersPerMonth: 100,
    }),
  },

  itemkuOrder: {
    findUnique: async () =>
      scenario === "duplicate" ? { id: "existing-order" } : null,
  },

  itemkuProduct: {
    findUnique: async () => ({
      id: "product-test",
      usingDeliveryInfo: false,
      deliveryInfoFields: null,
    }),
  },

  $transaction: async (callback) => {
    transactionCalls++;

    return callback({
      itemkuOrder: {
        count: async () => {
          if (scenario === "quota-full") return 100;
          if (scenario === "quota-available") return 99;
          return 0;
        },

        create: async () => {
          createCalls++;
          return { id: "created-order" };
        },
      },
    });
  },
};

const mockNextResponse = {
  json(body, options = {}) {
    return {
      status: options.status || 200,
      body,
    };
  },
};

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

Module._load = function (request, parent, isMain) {
  if (request === "next/server") {
    return { NextResponse: mockNextResponse };
  }

  if (request === "@/lib/prisma") {
    return { prisma: mockPrisma };
  }

  if (request === "@/lib/crypto") {
    return {
      decryptToken: () => JSON.stringify({
        apiKey: "dummy-api-key",
        secretKey: "dummy-secret-key",
      }),
    };
  }

  if (request === "@/lib/itemku") {
    return {
      itemkuRequest: async () => {
        itemkuRequestCalls++;
        return {
          success: true,
          data: [{ ...fakeOrder }],
        };
      },
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

let POST;

try {
  ({ POST } = require(routePath));
} finally {
  Module._load = originalLoad;
}

function makeRequest() {
  return {
    headers: {
      get(name) {
        const headers = {
          "X-itemku": "dummy-shop",
          "content-length": "100",
        };

        return headers[name] ?? headers[name.toLowerCase()] ?? null;
      },
    },

    text: async () => JSON.stringify({
      data: [{ ...fakeOrder }],
    }),
  };
}

async function runScenario(name) {
  scenario = name;
  createCalls = 0;
  transactionCalls = 0;
  itemkuRequestCalls = 0;

  return POST(makeRequest(), {
    params: { connectionId: "connection-test" },
  });
}

(async () => {
  const full = await runScenario("quota-full");

  assert.equal(full.status, 200);
  assert.equal(full.body.verified, 0);
  assert.equal(full.body.quotaExceeded, 1);
  assert.equal(createCalls, 0);
  assert.equal(transactionCalls, 1);
  assert.equal(itemkuRequestCalls, 1);
  console.log("PASS: kuota penuh -> order tidak disimpan");

  const available = await runScenario("quota-available");

  assert.equal(available.status, 200);
  assert.equal(available.body.verified, 1);
  assert.equal(available.body.quotaExceeded, 0);
  assert.equal(createCalls, 1);
  assert.equal(transactionCalls, 1);
  console.log("PASS: kuota tersedia -> order berhasil disimpan");

  const duplicate = await runScenario("duplicate");

  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.duplicates, 1);
  assert.equal(duplicate.body.verified, 0);
  assert.equal(transactionCalls, 0);
  assert.equal(createCalls, 0);
  console.log("PASS: order duplikat -> tidak memakai kuota");

  console.log("\nSemua pengujian kuota webhook berhasil.");
  process.exitCode = 0;
})().catch((error) => {
  console.error("FAIL:", error);
  process.exitCode = 1;
});
