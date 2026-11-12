import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";
import { itemkuRequest } from "@/lib/itemku";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ItemkuProductData = {
  id: number;
  name: string;
  game_name?: string;
  item_type_name?: string;
  price?: number;
  stock?: number;
  minimum_order?: number;
  base_unit?: number;
  using_delivery_info?: boolean;
  delivery_info_field?: unknown;
};

type ItemkuProductResponse = {
  data?: {
    data?: ItemkuProductData[];
    total_item?: number;
    current_page?: number;
    next_page?: number | null;
  } | ItemkuProductData[];
};

async function getActiveSubscription(merchantId: string) {
  const subscription = await prisma.itemkuSubscription.findUnique({
    where: { merchantId },
  });

  if (
    !subscription ||
    subscription.status !== "ACTIVE" ||
    !subscription.endsAt ||
    subscription.endsAt <= new Date()
  ) {
    return null;
  }

  return subscription;
}

async function getItemkuCredentials(merchantId: string) {
  const connection = await prisma.platformConnection.findFirst({
    where: {
      merchantId,
      platform: "ITEMKU",
      status: "connected",
    },
    select: {
      encryptedCredentials: true,
    },
  });

  if (!connection?.encryptedCredentials) {
    return null;
  }

  return JSON.parse(
    decryptToken(connection.encryptedCredentials)
  ) as {
    apiKey: string;
    secretKey: string;
  };
}

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const products = await prisma.itemkuProduct.findMany({
      where: { merchantId: merchant.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/itemku/products:", error);

    return NextResponse.json(
      { error: "Gagal mengambil produk Itemku." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const subscription = await getActiveSubscription(merchant.id);

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription Itemku tidak aktif atau sudah kedaluwarsa." },
        { status: 403 }
      );
    }

    const credentials = await getItemkuCredentials(merchant.id);

    if (!credentials) {
      return NextResponse.json(
        { error: "Hubungkan akun Itemku terlebih dahulu." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const page = Number(body.page ?? 1);

    if (!Number.isInteger(page) || page < 1 || page > 5000) {
      return NextResponse.json(
        { error: "Nomor halaman tidak valid." },
        { status: 400 }
      );
    }

    const result = await itemkuRequest<ItemkuProductResponse>(
      credentials,
      "/api/product/list",
      { page }
    );

    const responseData = result.data;
    const remoteProducts = Array.isArray(responseData)
      ? responseData
      : responseData?.data ?? [];

    const currentCount = await prisma.itemkuProduct.count({
      where: { merchantId: merchant.id },
    });

    let synced = 0;
    let skipped = 0;
    let newProducts = 0;

    for (const product of remoteProducts) {
      if (
        !Number.isInteger(product.id) ||
        product.id <= 0 ||
        !product.name
      ) {
        skipped++;
        continue;
      }

      const existing = await prisma.itemkuProduct.findUnique({
        where: {
          merchantId_itemkuProductId: {
            merchantId: merchant.id,
            itemkuProductId: product.id,
          },
        },
        select: { id: true },
      });

      if (!existing && currentCount + newProducts >= subscription.maxProducts) {
        skipped++;
        continue;
      }

      await prisma.itemkuProduct.upsert({
        where: {
          merchantId_itemkuProductId: {
            merchantId: merchant.id,
            itemkuProductId: product.id,
          },
        },
        create: {
          merchantId: merchant.id,
          itemkuProductId: product.id,
          name: product.name,
          gameName: product.game_name ?? null,
          itemTypeName: product.item_type_name ?? null,
          price: Number(product.price ?? 0),
          stock: Number(product.stock ?? 0),
          minimumOrder: Number(product.minimum_order ?? 1),
          baseUnit: Number(product.base_unit ?? 1),
          usingDeliveryInfo: Boolean(product.using_delivery_info),
          deliveryInfoFields: product.delivery_info_field
            ? JSON.stringify(product.delivery_info_field)
            : null,
          fulfillmentMode: product.using_delivery_info
            ? "MANUAL_STOCK"
            : "MANUAL_STOCK",
          syncedAt: new Date(),
        },
        update: {
          name: product.name,
          gameName: product.game_name ?? null,
          itemTypeName: product.item_type_name ?? null,
          price: Number(product.price ?? 0),
          stock: Number(product.stock ?? 0),
          minimumOrder: Number(product.minimum_order ?? 1),
          baseUnit: Number(product.base_unit ?? 1),
          usingDeliveryInfo: Boolean(product.using_delivery_info),
          deliveryInfoFields: product.delivery_info_field
            ? JSON.stringify(product.delivery_info_field)
            : null,
          syncedAt: new Date(),
        },
      });

      synced++;
      if (!existing) newProducts++;
    }

    return NextResponse.json({
      success: true,
      synced,
      skipped,
      currentPage: page,
      totalItem:
        !Array.isArray(responseData) && responseData
          ? responseData.total_item ?? null
          : null,
      nextPage:
        !Array.isArray(responseData) && responseData
          ? responseData.next_page ?? null
          : null,
      message: `${synced} produk berhasil disinkronkan.`,
    });
  } catch (error) {
    console.error("POST /api/itemku/products:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menyinkronkan produk Itemku.",
      },
      { status: 400 }
    );
  }
}
