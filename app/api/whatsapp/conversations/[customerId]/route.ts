import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    customerId: string;
  };
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const customerId = context.params.customerId;

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID wajib diisi." },
        { status: 400 }
      );
    }

    const pageParam = Number(
      request.nextUrl.searchParams.get("page") || "1"
    );

    const limitParam = Number(
      request.nextUrl.searchParams.get("limit") || "30"
    );

    const page = Number.isFinite(pageParam)
      ? Math.max(1, Math.floor(pageParam))
      : 1;

    const limit = Number.isFinite(limitParam)
      ? Math.min(50, Math.max(1, Math.floor(limitParam)))
      : 30;

    // Pastikan pelanggan benar-benar milik merchant.
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        merchantId: merchant.id,
        whatsappId: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        whatsappId: true,
        totalOrders: true,
        totalSpent: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Pelanggan WhatsApp tidak ditemukan." },
        { status: 404 }
      );
    }

    const messageWhere = {
      customerId: customer.id,
    };

    const [messages, total] = await Promise.all([
      prisma.whatsAppMessage.findMany({
        where: messageWhere,
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          externalMessageId: true,
          direction: true,
          messageType: true,
          content: true,
          status: true,
          createdAt: true,
          platformConnection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      prisma.whatsAppMessage.count({
        where: messageWhere,
      }),
    ]);

    return NextResponse.json({
      success: true,
      customer,
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error(
      "WhatsApp conversation detail error:",
      error
    );

    return NextResponse.json(
      { error: "Gagal mengambil riwayat percakapan." },
      { status: 500 }
    );
  }
}
