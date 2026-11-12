import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(
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

    const body = await request.json().catch(() => ({}));

    const fulfillmentMode = body.fulfillmentMode;
    const digiflazzProductCode =
      typeof body.digiflazzProductCode === "string"
        ? body.digiflazzProductCode.trim()
        : "";

    if (
      fulfillmentMode !== "MANUAL_STOCK" &&
      fulfillmentMode !== "DIGIFLAZZ"
    ) {
      return NextResponse.json(
        { error: "Mode fulfillment tidak valid." },
        { status: 400 }
      );
    }

    if (fulfillmentMode === "DIGIFLAZZ") {
      if (!digiflazzProductCode) {
        return NextResponse.json(
          { error: "Kode produk Digiflazz wajib diisi." },
          { status: 400 }
        );
      }

      const digiflazzConnection =
        await prisma.platformConnection.findFirst({
          where: {
            merchantId: merchant.id,
            platform: "DIGIFLAZZ",
            status: "connected",
            encryptedCredentials: { not: null },
          },
          select: { id: true },
        });

      if (!digiflazzConnection) {
        return NextResponse.json(
          {
            error:
              "Hubungkan akun Digiflazz terlebih dahulu di Store Settings.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.itemkuProduct.update({
      where: { id: product.id },
      data: {
        fulfillmentMode,
        digiflazzProductCode:
          fulfillmentMode === "DIGIFLAZZ"
            ? digiflazzProductCode
            : null,
      },
    });

    return NextResponse.json({
      success: true,
      product: updated,
      message: "Pengaturan fulfillment produk berhasil diperbarui.",
    });
  } catch (error) {
    console.error("PATCH Itemku product:", error);

    return NextResponse.json(
      { error: "Gagal memperbarui pengaturan produk." },
      { status: 500 }
    );
  }
}
