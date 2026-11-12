import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";
import { itemkuRequest } from "@/lib/itemku";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

type ItemkuStockUpdateResponse = {
  data?: unknown;
  message?: string;
};

export async function POST(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const subscription = await prisma.itemkuSubscription.findUnique({
      where: { merchantId: merchant.id },
    });

    if (
      !subscription ||
      subscription.status !== "ACTIVE" ||
      !subscription.endsAt ||
      subscription.endsAt <= new Date()
    ) {
      return NextResponse.json(
        { error: "Subscription Itemku tidak aktif." },
        { status: 403 }
      );
    }

    const product = await prisma.itemkuProduct.findFirst({
      where: {
        id: params.id,
        merchantId: merchant.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    if (product.fulfillmentMode !== "MANUAL_STOCK") {
      return NextResponse.json(
        {
          error:
            "Sinkronisasi stok hanya tersedia untuk produk Manual Stock.",
        },
        { status: 400 }
      );
    }

    if (product.usingDeliveryInfo) {
      return NextResponse.json(
        {
          error:
            "Produk ini menggunakan delivery information. Periksa pengaturan produk di Itemku sebelum sinkronisasi stok.",
        },
        { status: 400 }
      );
    }

    const connection = await prisma.platformConnection.findFirst({
      where: {
        merchantId: merchant.id,
        platform: "ITEMKU",
        status: "connected",
      },
      select: {
        encryptedCredentials: true,
      },
    });

    if (!connection?.encryptedCredentials) {
      return NextResponse.json(
        { error: "Hubungkan akun Itemku terlebih dahulu." },
        { status: 400 }
      );
    }

    const credentials = JSON.parse(
      decryptToken(connection.encryptedCredentials)
    ) as {
      apiKey: string;
      secretKey: string;
    };

    const availableStock = await prisma.itemkuStock.count({
      where: {
        merchantId: merchant.id,
        productId: product.id,
        status: "AVAILABLE",
      },
    });

    if (!Number.isInteger(availableStock) || availableStock < 0 || availableStock > 99999999) {
      return NextResponse.json(
        { error: "Jumlah stok harus berada antara 0 dan 99.999.999." },
        { status: 400 }
      );
    }

    const result = await itemkuRequest<ItemkuStockUpdateResponse>(
      credentials,
      "/api/product/stock/update",
      {
        product_id: product.itemkuProductId,
        new_stock: availableStock,
      }
    );

    await prisma.itemkuProduct.update({
      where: { id: product.id },
      data: {
        stock: availableStock,
        syncedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      productId: product.id,
      itemkuProductId: product.itemkuProductId,
      availableStock,
      message: `Stok ${availableStock} berhasil dikirim ke Itemku.`,
      result: result.data ?? null,
    });
  } catch (error) {
    console.error("POST Itemku sync stock:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menyinkronkan stok ke Itemku.",
      },
      { status: 400 }
    );
  }
}
