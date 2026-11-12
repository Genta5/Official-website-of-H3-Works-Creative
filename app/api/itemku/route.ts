import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { encryptToken } from "@/lib/crypto";
import { itemkuRequest } from "@/lib/itemku";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ItemkuOrderListResponse = {
  success: boolean;
  data?: unknown[];
  message?: string;
  statusCode?: string;
};

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const connection = await prisma.platformConnection.findFirst({
      where: {
        merchantId: merchant.id,
        platform: "ITEMKU",
      },
      select: {
        id: true,
        name: true,
        status: true,
        connectedAt: true,
        createdAt: true,
      },
    });

    const appUrl = process.env.APP_URL?.trim().replace(/\/+$/, "");

    return NextResponse.json({
      connected: connection?.status === "connected",
      webhookUrl:
        connection && appUrl
          ? `${appUrl}/api/itemku/webhook/${encodeURIComponent(connection.id)}`
          : null,
      connection: connection
        ? {
            id: connection.id,
            name: connection.name,
            status: connection.status,
            connectedAt: connection.connectedAt,
            createdAt: connection.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/itemku:", error);

    return NextResponse.json(
      { error: "Gagal mengambil status koneksi Itemku." },
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

    const now = new Date();

    const itemkuEntitlement = await prisma.planSubscription.findFirst({
      where: {
        merchantId: merchant.id,
        status: "ACTIVE",
        startsAt: { lte: now },
        endsAt: { gt: now },
        items: {
          some: {
            serviceKey: { in: ["itemku", "ITEMKU"] },
          },
        },
      },
      include: {
        items: {
          where: {
            serviceKey: { in: ["itemku", "ITEMKU"] },
          },
        },
      },
      orderBy: { endsAt: "desc" },
    });

    if (!itemkuEntitlement) {
      return NextResponse.json(
        { error: "Paket Itemku Automation belum aktif. Silakan berlangganan terlebih dahulu." },
        { status: 403 }
      );
    }

    const itemkuConnectionCount = await prisma.platformConnection.count({
      where: {
        merchantId: merchant.id,
        platform: "ITEMKU",
      },
    });

    const itemkuConnectionLimit =
      itemkuEntitlement.items[0]?.connectionLimit ?? 0;

    if (itemkuConnectionCount >= itemkuConnectionLimit) {
      return NextResponse.json(
        { error: "Batas koneksi Itemku pada paket kamu sudah tercapai." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const apiKey =
      typeof body.apiKey === "string" ? body.apiKey.trim() : "";
    const secretKey =
      typeof body.secretKey === "string" ? body.secretKey.trim() : "";

    if (
      !apiKey ||
      !secretKey ||
      apiKey.length > 500 ||
      secretKey.length > 1000
    ) {
      return NextResponse.json(
        { error: "API Key dan Secret Key wajib diisi dengan benar." },
        { status: 400 }
      );
    }

    // Uji kredensial melalui endpoint daftar pesanan.
    // Tanggal dibatasi dalam rentang yang diterima dokumentasi Itemku.
    const dateStart = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10);

    await itemkuRequest<ItemkuOrderListResponse>(
      { apiKey, secretKey },
      "/api/order/list",
      {
        date_start: dateStart,
        limit: 1,
      }
    );

    const encryptedCredentials = encryptToken(
      JSON.stringify({ apiKey, secretKey })
    );

    const existing = await prisma.platformConnection.findFirst({
      where: {
        merchantId: merchant.id,
        platform: "ITEMKU",
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.platformConnection.update({
        where: { id: existing.id },
        data: {
          name: "Itemku",
          externalId: merchant.id,
          username: "Itemku Seller",
          encryptedCredentials,
          status: "connected",
          connectedAt: new Date(),
        },
      });
    } else {
      await prisma.platformConnection.create({
        data: {
          merchantId: merchant.id,
          platform: "ITEMKU",
          name: "Itemku",
          externalId: merchant.id,
          username: "Itemku Seller",
          encryptedCredentials,
          status: "connected",
          connectedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      connected: true,
      message: "Akun Itemku berhasil diverifikasi dan dihubungkan.",
    });
  } catch (error) {
    console.error("POST /api/itemku:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghubungkan akun Itemku.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const connection = await prisma.platformConnection.findFirst({
      where: {
        merchantId: merchant.id,
        platform: "ITEMKU",
      },
      select: { id: true },
    });

    if (connection) {
      await prisma.platformConnection.update({
        where: { id: connection.id },
        data: {
          status: "disconnected",
          encryptedCredentials: null,
          username: null,
          connectedAt: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      connected: false,
      message: "Koneksi Itemku berhasil diputuskan.",
    });
  } catch (error) {
    console.error("DELETE /api/itemku:", error);

    return NextResponse.json(
      { error: "Gagal memutuskan koneksi Itemku." },
      { status: 500 }
    );
  }
}
