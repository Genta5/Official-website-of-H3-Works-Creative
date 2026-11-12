import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const connections = await prisma.platformConnection.findMany({
      where: {
        merchantId: merchant.id,
      },
      select: {
        id: true,
        platform: true,
        name: true,
        externalId: true,
        username: true,
        status: true,
        connectedAt: true,
        createdAt: true,
        subscriptions: {
          select: {
            id: true,
            durationMonths: true,
            status: true,
            startsAt: true,
            endsAt: true,
            amount: true,
            currency: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      connections,
      total: connections.length,
      summary: {
        telegram: connections.filter(
          (item) => item.platform === "TELEGRAM"
        ).length,
        whatsapp: connections.filter(
          (item) => item.platform === "WHATSAPP"
        ).length,
        connected: connections.filter(
          (item) => item.status === "connected"
        ).length,
      },
    });
  } catch (error) {
    console.error("Get platform connections error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil daftar koneksi platform." },
      { status: 500 }
    );
  }
}
