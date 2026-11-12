import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySecret(received: string | null, expected: string): boolean {
  if (!received || !expected) return false;

  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.ITEMKU_WORKER_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Worker belum dikonfigurasi." },
      { status: 503 }
    );
  }

  if (
    !verifySecret(
      request.headers.get("x-worker-secret"),
      expectedSecret
    )
  ) {
    return NextResponse.json(
      { error: "Autentikasi worker gagal." },
      { status: 401 }
    );
  }

  try {
    const receivedOrders = await prisma.itemkuOrder.findMany({
      where: {
        processingStatus: "RECEIVED",
        status: "REQUIRE_PROCESS",
        processedAt: null,
        deliveredAt: null,
        deliveryAttemptedAt: null,
      },
      select: {
        id: true,
        orderNumber: true,
        productName: true,
        quantity: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 10,
    });

    const [receivedCount, processingCount, completedCount] =
      await Promise.all([
        prisma.itemkuOrder.count({
          where: { processingStatus: "RECEIVED" },
        }),
        prisma.itemkuOrder.count({
          where: { processingStatus: "PROCESSING" },
        }),
        prisma.itemkuOrder.count({
          where: { processingStatus: "COMPLETED" },
        }),
      ]);

    return NextResponse.json({
      success: true,
      mode: "READ_ONLY",
      deliveryEnabled: false,
      summary: {
        received: receivedCount,
        processing: processingCount,
        completed: completedCount,
        batchSize: receivedOrders.length,
      },
      orders: receivedOrders,
    });
  } catch (error) {
    console.error("[ITEMKU WORKER]", error);

    return NextResponse.json(
      { error: "Gagal membaca antrean order." },
      { status: 500 }
    );
  }
}
