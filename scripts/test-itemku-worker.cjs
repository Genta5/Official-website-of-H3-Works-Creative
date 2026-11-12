const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const routePath = path.join(
  process.cwd(),
  "app/api/worker/itemku/route.ts"
);

let findManyCalls = 0;
let countCalls = 0;

const mockPrisma = {
  itemkuOrder: {
    findMany: async () => {
      findManyCalls++;
      return [{
        id: "test-order",
        orderNumber: "TEST-001",
        productName: "Test Product",
        quantity: 1,
        createdAt: new Date("2026-01-01T00:00:00Z"),
      }];
    },
    count: async () => {
      countCalls++;
      return 1;
    },
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
  if (request === "server-only") return {};
  if (request === "next/server") {
    return { NextResponse: mockNextResponse };
  }
  if (request === "@/lib/prisma") {
    return { prisma: mockPrisma };
  }
  if (
    request.includes("itemku-fulfillment") ||
    request === "@/lib/itemku"
  ) {
    throw new Error("STOP: delivery module tidak boleh dimuat oleh worker.");
  }
  return originalLoad.call(this, request, parent, isMain);
};

let POST;

try {
  ({ POST } = require(routePath));
} finally {
  Module._load = originalLoad;
}

function makeRequest(secret) {
  return {
    headers: {
      get(name) {
        return name === "x-worker-secret" ? secret : null;
      },
    },
  };
}

async function main() {
  const originalSecret = process.env.ITEMKU_WORKER_SECRET;

  try {
    delete process.env.ITEMKU_WORKER_SECRET;

    const missing = await POST(makeRequest(null));
    assert.equal(missing.status, 503);
    assert.equal(findManyCalls, 0);
    console.log("PASS: secret tidak dikonfigurasi -> 503");

    process.env.ITEMKU_WORKER_SECRET = "test-worker-secret";

    const invalid = await POST(makeRequest("wrong-secret"));
    assert.equal(invalid.status, 401);
    assert.equal(findManyCalls, 0);
    console.log("PASS: secret salah -> 401");

    const valid = await POST(makeRequest("test-worker-secret"));
    assert.equal(valid.status, 200);
    assert.equal(valid.body.success, true);
    assert.equal(valid.body.mode, "READ_ONLY");
    assert.equal(valid.body.deliveryEnabled, false);
    assert.equal(valid.body.orders.length, 1);
    assert.equal("merchantId" in valid.body.orders[0], false);
    assert.equal("itemkuOrderId" in valid.body.orders[0], false);
    assert.equal(findManyCalls, 1);
    assert.equal(countCalls, 3);
    console.log("PASS: secret benar -> antrean terbaca");
    console.log("PASS: data internal tidak diekspos");
    console.log("PASS: hanya query read-only yang dipanggil");
    console.log("PASS: tidak memuat modul delivery Itemku");
  } finally {
    if (originalSecret === undefined) {
      delete process.env.ITEMKU_WORKER_SECRET;
    } else {
      process.env.ITEMKU_WORKER_SECRET = originalSecret;
    }
  }
}

main()
  .then(() => {
    console.log("\nSemua pengujian worker berhasil.");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
