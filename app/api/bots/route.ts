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

    const bots = await prisma.bot.findMany({
      where: {
        merchantId: merchant.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        status: true,
        connectedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ bots });
  } catch (error) {
    console.error("Get bots error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil daftar bot." },
      { status: 500 }
    );
  }
}
