import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { encryptToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
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

    const product = await prisma.itemkuProduct.findFirst({
      where: {
        id: params.id,
        merchantId: merchant.id,
      },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    const [available, reserved, delivered] = await Promise.all([
      prisma.itemkuStock.count({
        where: {
          productId: product.id,
          merchantId: merchant.id,
          status: "AVAILABLE",
        },
      }),
      prisma.itemkuStock.count({
        where: {
          productId: product.id,
          merchantId: merchant.id,
          status: "RESERVED",
        },
      }),
      prisma.itemkuStock.count({
        where: {
          productId: product.id,
          merchantId: merchant.id,
          status: "DELIVERED",
        },
      }),
    ]);

    return NextResponse.json({
      stock: { available, reserved, delivered },
    });
  } catch (error) {
    console.error("GET Itemku stock:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data stok." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
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
            "Produk ini tidak menggunakan mode stok manual.",
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const stockItems = body.stockItems;

    if (
      !Array.isArray(stockItems) ||
      stockItems.length < 1 ||
      stockItems.length > 100
    ) {
      return NextResponse.json(
        {
          error: "Masukkan 1 sampai 100 item stok dalam satu kali proses.",
        },
        { status: 400 }
      );
    }

    if (!product.usingDeliveryInfo) {
      return NextResponse.json(
        {
          error:
            "Produk ini tidak menggunakan delivery_info. Manual Stock belum mendukung fulfillment top-up.",
        },
        { status: 400 }
      );
    }

    let deliveryFields: string[] = [];

    if (product.deliveryInfoFields) {
      try {
        const parsedFields: unknown = JSON.parse(
          product.deliveryInfoFields
        );

        if (!Array.isArray(parsedFields)) {
          throw new Error("Konfigurasi field Itemku tidak valid.");
        }

        deliveryFields = parsedFields
          .map((field) => {
            if (!field || typeof field !== "object") return null;

            const record = field as Record<string, unknown>;

            return typeof record.field_name === "string"
              ? record.field_name.trim()
              : null;
          })
          .filter((field): field is string => Boolean(field));

      } catch {
        return NextResponse.json(
          { error: "Konfigurasi field delivery Itemku tidak valid." },
          { status: 400 }
        );
      }
    }

    const cleanedItems: string[] = [];

    for (const item of stockItems) {
      if (typeof item !== "string") {
        return NextResponse.json(
          { error: "Format item stok harus berupa teks." },
          { status: 400 }
        );
      }

      const value = item.trim();

      if (!value || value.length > 10000) {
        return NextResponse.json(
          { error: "Setiap item stok harus berisi 1 sampai 10.000 karakter." },
          { status: 400 }
        );
      }

      if (deliveryFields.length > 0) {
        let parsedItem: unknown;

        try {
          parsedItem = JSON.parse(value);
        } catch {
          return NextResponse.json(
            { error: "Setiap stok akun harus berupa objek JSON yang valid." },
            { status: 400 }
          );
        }

        if (
          !parsedItem ||
          typeof parsedItem !== "object" ||
          Array.isArray(parsedItem)
        ) {
          return NextResponse.json(
            { error: "Format stok akun harus berupa objek JSON." },
            { status: 400 }
          );
        }

        const record = parsedItem as Record<string, unknown>;
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
          return NextResponse.json(
            {
              error: `Field stok akun harus sesuai: ${deliveryFields.join(", ")}.`,
            },
            { status: 400 }
          );
        }
      }

      cleanedItems.push(value);
    }

    const totalCharacters = cleanedItems.reduce(
      (total, item) => total + item.length,
      0
    );

    if (totalCharacters > 100000) {
      return NextResponse.json(
        { error: "Total data stok maksimal 100.000 karakter per request." },
        { status: 400 }
      );
    }

    const availableStock = await prisma.$transaction(async (tx) => {
      await tx.itemkuStock.createMany({
        data: cleanedItems.map((value) => ({
          merchantId: merchant.id,
          productId: product.id,
          encryptedDeliveryInfo: encryptToken(value),
          status: "AVAILABLE",
        })),
      });

      const totalAvailable = await tx.itemkuStock.count({
        where: {
          merchantId: merchant.id,
          productId: product.id,
          status: "AVAILABLE",
        },
      });

      await tx.itemkuProduct.update({
        where: { id: product.id },
        data: {
          stock: totalAvailable,
        },
      });

      return totalAvailable;
    });

    return NextResponse.json({
      success: true,
      added: cleanedItems.length,
      availableStock,
      message: `${cleanedItems.length} item stok berhasil disimpan.`,
    });
  } catch (error) {
    console.error("POST Itemku stock:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan stok Itemku." },
      { status: 500 }
    );
  }
}
