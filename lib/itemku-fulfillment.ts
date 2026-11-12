import "server-only";

import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/crypto";
import type { ItemkuDeliveryInfo } from "@/lib/itemku";


type ReservationResult =
  | {
      success: true;
      orderId: string;
      reservedCount: number;
      stockIds: string[];
    }
  | {
      success: false;
      reason: string;
    };

export async function reserveItemkuStock(
  merchantId: string,
  orderId: string
): Promise<ReservationResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      // Ambil pesanan yang masih menunggu proses.
      const order = await tx.itemkuOrder.findFirst({
        where: {
          id: orderId,
          merchantId,
          processingStatus: "RECEIVED",
          status: "REQUIRE_PROCESS",
        },
      });

      if (!order) {
        return {
          success: false,
          reason: "ORDER_NOT_AVAILABLE",
        };
      }

      if (!order.productId) {
        return {
          success: false,
          reason: "PRODUCT_NOT_FOUND",
        };
      }

      // Pastikan produk memang milik merchant.
      const product = await tx.itemkuProduct.findFirst({
        where: {
          id: order.productId,
          merchantId,
          isActive: true,
        },
      });

      if (!product) {
        return {
          success: false,
          reason: "PRODUCT_NOT_AVAILABLE",
        };
      }

      if (product.fulfillmentMode !== "MANUAL_STOCK") {
        return {
          success: false,
          reason: "UNSUPPORTED_FULFILLMENT_MODE",
        };
      }

      // Konversi baseUnit belum diterapkan.
      if (product.baseUnit !== 1) {
        return {
          success: false,
          reason: "UNSUPPORTED_BASE_UNIT",
        };
      }

      if (
        !Number.isSafeInteger(order.quantity) ||
        order.quantity < 1
      ) {
        return {
          success: false,
          reason: "INVALID_QUANTITY",
        };
      }

      if (order.quantity < product.minimumOrder) {
        return {
          success: false,
          reason: "MINIMUM_ORDER_NOT_MET",
        };
      }

      // Klaim pesanan secara bersyarat.
      const claimed = await tx.itemkuOrder.updateMany({
        where: {
          id: order.id,
          merchantId,
          processingStatus: "RECEIVED",
          status: "REQUIRE_PROCESS",
        },
        data: {
          processingStatus: "PROCESSING",
          lastError: null,
        },
      });

      if (claimed.count !== 1) {
        return {
          success: false,
          reason: "ORDER_ALREADY_CLAIMED",
        };
      }

      // Ambil stok yang tersedia.
      const stocks = await tx.itemkuStock.findMany({
        where: {
          merchantId,
          productId: product.id,
          status: "AVAILABLE",
          orderId: null,
        },
        select: {
          id: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: order.quantity,
      });

      if (stocks.length !== order.quantity) {
        await tx.itemkuOrder.updateMany({
          where: {
            id: order.id,
            merchantId,
            processingStatus: "PROCESSING",
            status: "REQUIRE_PROCESS",
          },
          data: {
            processingStatus: "RECEIVED",
            lastError: "Stok tidak mencukupi.",
          },
        });

        return {
          success: false,
          reason: "INSUFFICIENT_STOCK",
        };
      }

      const stockIds = stocks.map((stock) => stock.id);

      // Reservasi setiap stok hanya jika masih AVAILABLE.
      for (const stockId of stockIds) {
        const reserved = await tx.itemkuStock.updateMany({
          where: {
            id: stockId,
            merchantId,
            productId: product.id,
            status: "AVAILABLE",
            orderId: null,
          },
          data: {
            status: "RESERVED",
            orderId: order.id,
            reservedAt: new Date(),
          },
        });

        if (reserved.count !== 1) {
          throw new Error("STOCK_RESERVATION_CONFLICT");
        }
      }

      return {
        success: true,
        orderId: order.id,
        reservedCount: stockIds.length,
        stockIds,
      };
    });
  } catch (error) {
    console.error("Itemku stock reservation failed:", error);

    return {
      success: false,
      reason: "RESERVATION_FAILED",
    };
  }
}

export async function markItemkuDeliveryAttempted(
  merchantId: string,
  orderId: string
): Promise<boolean> {
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.itemkuOrder.findFirst({
        where: {
          id: orderId,
          merchantId,
          processingStatus: "PROCESSING",
          status: "REQUIRE_PROCESS",
          deliveryAttemptedAt: null,
          processedAt: null,
          deliveredAt: null,
        },
        select: {
          quantity: true,
          productId: true,
        },
      });

      if (!order || !order.productId) return false;

      const reservedCount = await tx.itemkuStock.count({
        where: {
          merchantId,
          productId: order.productId,
          orderId,
          status: "RESERVED",
          deliveredAt: null,
        },
      });

      if (reservedCount !== order.quantity) return false;

      const updated = await tx.itemkuOrder.updateMany({
        where: {
          id: orderId,
          merchantId,
          processingStatus: "PROCESSING",
          status: "REQUIRE_PROCESS",
          deliveryAttemptedAt: null,
          processedAt: null,
          deliveredAt: null,
        },
        data: {
          deliveryAttemptedAt: new Date(),
        },
      });

      return updated.count === 1;
    });
  } catch (error) {
    console.error("Itemku delivery attempt marking failed:", error);
    return false;
  }
}

type ReleaseResult =
  | {
      success: true;
      orderId: string;
      releasedCount: number;
    }
  | {
      success: false;
      reason: string;
    };

export async function releaseItemkuReservation(
  merchantId: string,
  orderId: string
): Promise<ReleaseResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const claimed = await tx.itemkuOrder.updateMany({
        where: {
          id: orderId,
          merchantId,
          processingStatus: "PROCESSING",
          status: "REQUIRE_PROCESS",
          processedAt: null,
          deliveredAt: null,
          deliveryAttemptedAt: null,
        },
        data: {
          processingStatus: "RECEIVED",
        },
      });

      if (claimed.count !== 1) {
        return {
          success: false,
          reason: "ORDER_NOT_SAFE_TO_RELEASE",
        };
      }

      const order = await tx.itemkuOrder.findFirst({
        where: {
          id: orderId,
          merchantId,
        },
        select: {
          quantity: true,
          productId: true,
        },
      });

      if (!order || !order.productId) {
        throw new Error("RESERVATION_STOCK_COUNT_MISMATCH");
      }

      const reservedCount = await tx.itemkuStock.count({
        where: {
          merchantId,
          productId: order.productId,
          orderId,
          status: "RESERVED",
          deliveredAt: null,
        },
      });

      if (reservedCount !== order.quantity) {
        throw new Error("RESERVATION_STOCK_COUNT_MISMATCH");
      }

      const released = await tx.itemkuStock.updateMany({
        where: {
          merchantId,
          productId: order.productId,
          orderId,
          status: "RESERVED",
          deliveredAt: null,
        },
        data: {
          status: "AVAILABLE",
          orderId: null,
          reservedAt: null,
        },
      });

      if (released.count !== order.quantity) {
        throw new Error("RESERVATION_RELEASE_CONFLICT");
      }

      await tx.itemkuOrder.updateMany({
        where: {
          id: orderId,
          merchantId,
        },
        data: {
          lastError: "Reservasi stok dilepas sebelum pengiriman.",
        },
      });

      return {
        success: true,
        orderId,
        releasedCount: released.count,
      };
    });
  } catch (error) {
    console.error("Itemku stock release failed:", error);

    return {
      success: false,
      reason: "RELEASE_FAILED",
    };
  }
}

export async function completeItemkuDelivery(
  merchantId: string,
  orderId: string
): Promise<boolean> {
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.itemkuOrder.findFirst({
        where: {
          id: orderId,
          merchantId,
          processingStatus: "PROCESSING",
          status: "REQUIRE_PROCESS",
          deliveryAttemptedAt: { not: null },
          processedAt: null,
          deliveredAt: null,
        },
        select: {
          quantity: true,
          productId: true,
        },
      });

      if (
        !order ||
        !order.productId ||
        !Number.isSafeInteger(order.quantity) ||
        order.quantity < 1
      ) {
        return false;
      }

      const stockWhere = {
        merchantId,
        productId: order.productId,
        orderId,
        status: "RESERVED",
        deliveredAt: null,
      };

      const reservedCount = await tx.itemkuStock.count({
        where: stockWhere,
      });

      if (reservedCount !== order.quantity) {
        return false;
      }

      const now = new Date();

      const completedStocks = await tx.itemkuStock.updateMany({
        where: stockWhere,
        data: {
          status: "DELIVERED",
          deliveredAt: now,
        },
      });

      if (completedStocks.count !== order.quantity) {
        throw new Error("DELIVERY_STOCK_COUNT_MISMATCH");
      }

      const completedOrder = await tx.itemkuOrder.updateMany({
        where: {
          id: orderId,
          merchantId,
          processingStatus: "PROCESSING",
          status: "REQUIRE_PROCESS",
          deliveryAttemptedAt: { not: null },
          processedAt: null,
          deliveredAt: null,
        },
        data: {
          processingStatus: "COMPLETED",
          status: "DELIVERED",
          processedAt: now,
          deliveredAt: now,
          lastError: null,
        },
      });

      if (completedOrder.count !== 1) {
        throw new Error("DELIVERY_ORDER_COMPLETION_CONFLICT");
      }

      return true;
    });
  } catch (error) {
    console.error("Itemku delivery completion failed:", error);
    return false;
  }
}


export type PrepareItemkuDeliveryInfoResult =
  | {
      success: true;
      deliveryInfo: ItemkuDeliveryInfo;
    }
  | {
      success: false;
      reason: string;
    };

/**
 * Menyiapkan payload delivery secara read-only.
 * Fungsi ini TIDAK memanggil API Itemku dan tidak mengubah status database.
 */
export async function prepareItemkuDeliveryInfo(
  merchantId: string,
  orderId: string
): Promise<PrepareItemkuDeliveryInfoResult> {
  try {
    const order = await prisma.itemkuOrder.findFirst({
      where: {
        id: orderId,
        merchantId,
        processingStatus: "PROCESSING",
        status: "REQUIRE_PROCESS",
        processedAt: null,
        deliveredAt: null,
        deliveryAttemptedAt: null,
      },
      select: {
        quantity: true,
        productId: true,
      },
    });

    if (!order || !order.productId) {
      return { success: false, reason: "ORDER_NOT_AVAILABLE" };
    }

    if (!Number.isSafeInteger(order.quantity) || order.quantity < 1) {
      return { success: false, reason: "INVALID_ORDER_QUANTITY" };
    }

    const product = await prisma.itemkuProduct.findFirst({
      where: {
        id: order.productId,
        merchantId,
        isActive: true,
        fulfillmentMode: "MANUAL_STOCK",
      },
      select: {
        usingDeliveryInfo: true,
        deliveryInfoFields: true,
        baseUnit: true,
      },
    });

    if (!product) {
      return { success: false, reason: "PRODUCT_NOT_AVAILABLE" };
    }

    if (!product.usingDeliveryInfo) {
      return { success: false, reason: "DELIVERY_INFO_NOT_SUPPORTED" };
    }

    if (product.baseUnit !== 1) {
      return { success: false, reason: "UNSUPPORTED_BASE_UNIT" };
    }

    let deliveryFields: string[] = [];

    if (product.deliveryInfoFields) {
      const parsedFields: unknown = JSON.parse(
        product.deliveryInfoFields
      );

      if (!Array.isArray(parsedFields)) {
        return { success: false, reason: "INVALID_DELIVERY_FIELDS" };
      }

      deliveryFields = parsedFields.map((field: unknown) => {
        if (!field || typeof field !== "object") {
          throw new Error("INVALID_DELIVERY_FIELDS");
        }

        const record = field as Record<string, unknown>;

        if (
          typeof record.field_name !== "string" ||
          !record.field_name.trim()
        ) {
          throw new Error("INVALID_DELIVERY_FIELDS");
        }

        return record.field_name.trim();
      });

      if (
        new Set(deliveryFields).size !== deliveryFields.length
      ) {
        return { success: false, reason: "DUPLICATE_DELIVERY_FIELDS" };
      }
    }

    const stocks = await prisma.itemkuStock.findMany({
      where: {
        merchantId,
        productId: product ? order.productId : "",
        orderId,
        status: "RESERVED",
        deliveredAt: null,
      },
      select: {
        encryptedDeliveryInfo: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (stocks.length !== order.quantity) {
      return { success: false, reason: "RESERVED_STOCK_COUNT_MISMATCH" };
    }

    if (deliveryFields.length === 0) {
      const deliveryInfo: string[] = stocks.map((stock) => {
        const value = decryptToken(stock.encryptedDeliveryInfo);

        if (!value.trim()) {
          throw new Error("EMPTY_DELIVERY_INFO");
        }

        return value.trim();
      });

      return { success: true, deliveryInfo };
    }

    const deliveryInfo: Array<Record<string, string>> = stocks.map(
      (stock) => {
        const decrypted = decryptToken(stock.encryptedDeliveryInfo);
        const parsed: unknown = JSON.parse(decrypted);

        if (
          !parsed ||
          typeof parsed !== "object" ||
          Array.isArray(parsed)
        ) {
          throw new Error("INVALID_STOCK_OBJECT");
        }

        const record = parsed as Record<string, unknown>;
        const keys = Object.keys(record);

        if (
          keys.length !== deliveryFields.length ||
          deliveryFields.some(
            (field) =>
              typeof record[field] !== "string" ||
              !(record[field] as string).trim()
          ) ||
          keys.some((key) => !deliveryFields.includes(key))
        ) {
          throw new Error("STOCK_FIELDS_MISMATCH");
        }

        return Object.fromEntries(
          deliveryFields.map((field) => [
            field,
            (record[field] as string).trim(),
          ])
        );
      }
    );

    return { success: true, deliveryInfo };
  } catch (error) {
    console.error("Itemku delivery preparation failed:", error);

    return {
      success: false,
      reason: "DELIVERY_INFO_PREPARATION_FAILED",
    };
  }
}
