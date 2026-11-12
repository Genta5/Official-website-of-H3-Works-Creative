import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/crypto";
import { itemkuRequest } from "@/lib/itemku";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    connectionId: string;
  };
};

type ItemkuOrder = {
  order_id: number;
  order_number: string;
  product_id: number;
  price: number;
  quantity: number;
  product_name: string;
  status: string;
  required_information?: string | null;
  using_delivery_info?: boolean;
  delivery_info_field?: unknown;
  order_created_at?: string;
};

type ItemkuOrderListResponse = {
  success: boolean;
  data?: ItemkuOrder[];
  message?: string;
};

function isValidOrder(order: unknown): order is ItemkuOrder {
  if (!order || typeof order !== "object") return false;

  const value = order as Record<string, unknown>;

  return (
    Number.isSafeInteger(value.order_id) &&
    Number(value.order_id) > 0 &&
    Number.isSafeInteger(value.product_id) &&
    Number(value.product_id) > 0 &&
    typeof value.order_number === "string" &&
    value.order_number.length > 0 &&
    typeof value.product_name === "string" &&
    Number.isSafeInteger(value.price) &&
    Number(value.price) >= 0 &&
    Number.isSafeInteger(value.quantity) &&
    Number(value.quantity) > 0 &&
    Number(value.price) * Number(value.quantity) <=
      Number.MAX_SAFE_INTEGER
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { connectionId } = context.params;

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID tidak valid." },
        { status: 400 }
      );
    }

    const shopId = request.headers.get("X-itemku");

    if (!shopId || shopId.trim().length === 0) {
      return NextResponse.json(
        { error: "Header X-itemku wajib tersedia." },
        { status: 401 }
      );
    }

    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload callback terlalu besar." },
        { status: 413 }
      );
    }

    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload callback terlalu besar." },
        { status: 413 }
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Format JSON callback tidak valid." },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray((body as { data?: unknown }).data)
    ) {
      return NextResponse.json(
        { error: "Format callback Itemku tidak valid." },
        { status: 400 }
      );
    }

    const callbackOrders = (body as { data: unknown[] }).data;

    if (callbackOrders.length === 0 || callbackOrders.length > 30) {
      return NextResponse.json(
        { error: "Jumlah pesanan callback tidak valid." },
        { status: 400 }
      );
    }

    const connection = await prisma.platformConnection.findFirst({
      where: {
        id: connectionId,
        platform: "ITEMKU",
        status: "connected",
        encryptedCredentials: { not: null },
      },
      select: {
        id: true,
        merchantId: true,
        encryptedCredentials: true,
      },
    });

    if (!connection?.encryptedCredentials) {
      return NextResponse.json(
        { error: "Koneksi Itemku tidak ditemukan atau tidak aktif." },
        { status: 404 }
      );
    }

    const subscription =
      await prisma.itemkuSubscription.findUnique({
        where: { merchantId: connection.merchantId },
        select: {
          status: true,
          startsAt: true,
        endsAt: true,
          maxOrdersPerMonth: true,
        },
      });

    if (
      subscription?.status !== "ACTIVE" ||
      (subscription.startsAt && subscription.startsAt > new Date()) ||
      !subscription.endsAt ||
      subscription.endsAt <= new Date()
    ) {
      return NextResponse.json(
        { error: "Subscription Itemku tidak aktif." },
        { status: 403 }
      );
    }

    const credentials = JSON.parse(
      decryptToken(connection.encryptedCredentials)
    ) as {
      apiKey: string;
      secretKey: string;
    };

    if (
      typeof credentials.apiKey !== "string" ||
      typeof credentials.secretKey !== "string"
    ) {
      throw new Error("Kredensial Itemku tidak valid.");
    }

    const dateStart = new Date(
      Date.now() - 59 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10);

    let verifiedCount = 0;
    let duplicateCount = 0;
    let ignoredCount = 0;
    let quotaExceededCount = 0;

    const jakartaNow = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const monthStart = new Date(
      Date.UTC(jakartaNow.getUTCFullYear(), jakartaNow.getUTCMonth(), 1) -
        7 * 60 * 60 * 1000
    );
    const nextMonthStart = new Date(
      Date.UTC(jakartaNow.getUTCFullYear(), jakartaNow.getUTCMonth() + 1, 1) -
        7 * 60 * 60 * 1000
    );

    for (const callbackOrder of callbackOrders) {
      if (!isValidOrder(callbackOrder)) {
        ignoredCount++;
        continue;
      }

      const verified = await itemkuRequest<ItemkuOrderListResponse>(
        credentials,
        "/api/order/list",
        {
          date_start: dateStart,
          order_id: callbackOrder.order_id,
          limit: 1,
        }
      );

      const order = verified.data?.find(
        (item) =>
          item.order_id === callbackOrder.order_id &&
          item.status === "REQUIRE_PROCESS"
      );

      if (!order || !isValidOrder(order)) {
        ignoredCount++;
        continue;
      }

      const existing = await prisma.itemkuOrder.findUnique({
        where: {
          merchantId_itemkuOrderId: {
            merchantId: connection.merchantId,
            itemkuOrderId: order.order_id,
          },
        },
        select: { id: true },
      });

      if (existing) {
        duplicateCount++;
        continue;
      }

      const product = await prisma.itemkuProduct.findUnique({
        where: {
          merchantId_itemkuProductId: {
            merchantId: connection.merchantId,
            itemkuProductId: order.product_id,
          },
        },
        select: {
          id: true,
          usingDeliveryInfo: true,
          deliveryInfoFields: true,
        },
      });

      try {
        const saved = await prisma.$transaction(async (tx) => {
          const monthlyOrderCount = await tx.itemkuOrder.count({
            where: {
              merchantId: connection.merchantId,
              createdAt: {
                gte: monthStart,
                lt: nextMonthStart,
              },
            },
          });

          if (monthlyOrderCount >= subscription.maxOrdersPerMonth) {
            return false;
          }

          await tx.itemkuOrder.create({
            data: {
              merchantId: connection.merchantId,
              productId: product?.id ?? null,
              itemkuOrderId: order.order_id,
              orderNumber: order.order_number,
              productName: order.product_name,
              status: "REQUIRE_PROCESS",
              processingStatus: "RECEIVED",
              quantity: order.quantity,
              price: order.price,
              total: order.price * order.quantity,
              requiredInformation: order.required_information ?? null,
              usingDeliveryInfo: Boolean(order.using_delivery_info),
              deliveryInfoFields: order.delivery_info_field
                ? JSON.stringify(order.delivery_info_field)
                : null,
              rawPayload: JSON.stringify(order),
            },
          });

          return true;
        });

        if (!saved) {
          quotaExceededCount++;
          continue;
        }

        verifiedCount++;
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2002"
        ) {
          duplicateCount++;
          continue;
        }

        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Callback Itemku berhasil diverifikasi.",
      received: callbackOrders.length,
      verified: verifiedCount,
      duplicates: duplicateCount,
      ignored: ignoredCount,
        quotaExceeded: quotaExceededCount,
    });
  } catch (error) {
    console.error("POST /api/itemku/webhook:", error);

    return NextResponse.json(
      { error: "Gagal memproses callback Itemku." },
      { status: 500 }
    );
  }
}
