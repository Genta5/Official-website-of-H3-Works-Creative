import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const pageParam = Number(
      request.nextUrl.searchParams.get("page") || "1"
    );

    const limitParam = Number(
      request.nextUrl.searchParams.get("limit") || "20"
    );

    const page = Number.isFinite(pageParam)
      ? Math.max(1, Math.floor(pageParam))
      : 1;

    const limit = Number.isFinite(limitParam)
      ? Math.min(50, Math.max(1, Math.floor(limitParam)))
      : 20;

    const where = {
      merchantId: merchant.id,
      whatsappId: {
        not: null,
      },
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: {
          updatedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          whatsappId: true,
          name: true,
          totalOrders: true,
          totalSpent: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              direction: true,
              messageType: true,
              content: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),

      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      conversations: customers.map((customer) => ({
        id: customer.id,
        whatsappId: customer.whatsappId,
        name: customer.name,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        messageCount: customer._count.messages,
        lastMessage: customer.messages[0] || null,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("WhatsApp conversations error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil daftar percakapan." },
      { status: 500 }
    );
  }
}
