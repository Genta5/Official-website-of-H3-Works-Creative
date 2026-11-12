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

    const now = new Date();

    const [activeSubscription, pendingSubscription, history] =
      await Promise.all([
        prisma.planSubscription.findFirst({
          where: {
            merchantId: merchant.id,
            status: "ACTIVE",
            startsAt: { lte: now },
            endsAt: { gt: now },
          },
          include: {
            items: true,
            payments: {
              where: { status: "PAID" },
              select: {
                id: true,
                amount: true,
                currency: true,
                paidAt: true,
              },
              take: 1,
            },
          },
          orderBy: { endsAt: "desc" },
        }),

        prisma.planSubscription.findFirst({
          where: {
            merchantId: merchant.id,
            status: "PENDING",
          },
          include: {
            items: true,
            payments: {
              where: { status: "PENDING" },
              select: {
                id: true,
                amount: true,
                currency: true,
                expiresAt: true,
              },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
        }),

        prisma.planSubscription.findMany({
          where: { merchantId: merchant.id },
          select: {
            id: true,
            planCode: true,
            durationMonths: true,
            status: true,
            amount: true,
            currency: true,
            startsAt: true,
            endsAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    const entitlements: Record<string, { enabled: boolean; connectionLimit: number }> = {};

    for (const item of activeSubscription?.items ?? []) {
      entitlements[item.serviceKey] = {
        enabled: true,
        connectionLimit: item.connectionLimit,
      };
    }

    return NextResponse.json({
      subscription: activeSubscription,
      pendingSubscription,
      entitlements,
      history,
      hasActiveSubscription: Boolean(activeSubscription),
      checkedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Get main subscription error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data langganan." },
      { status: 500 }
    );
  }
}

const SERVICE_PRICES: Record<string, number> = {
  telegram: 49000,
  whatsapp: 49000,
  discord: 49000,
  website: 79000,
  itemku: 49000,
};

const SERVICE_BUNDLES: Record<string, string[]> = {
  "all-in-one": ["telegram", "whatsapp", "discord", "website", "itemku"],
};

const DURATION_DISCOUNTS: Record<number, number> = {
  1: 0,
  3: 8,
  6: 15,
  12: 25,
};

export async function POST(request: Request) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (
      !Array.isArray(body.services) ||
      body.services.length === 0 ||
      !body.services.every((item: unknown) => typeof item === "string")
    ) {
      return NextResponse.json(
        { error: "Pilih minimal satu layanan yang valid." },
        { status: 400 }
      );
    }

    const allowedServices = Object.keys(SERVICE_PRICES);
    const selected = [...new Set(body.services as string[])];

    if (
      selected.some(
        (service) =>
          service !== "all-in-one" &&
          !allowedServices.includes(service)
      )
    ) {
      return NextResponse.json(
        { error: "Pilihan layanan tidak valid." },
        { status: 400 }
      );
    }

    if (
      selected.includes("all-in-one") &&
      selected.length !== 1
    ) {
      return NextResponse.json(
        { error: "All-in-One tidak dapat digabung dengan paket individual." },
        { status: 400 }
      );
    }

    const plan = body.plan;

    const durationMap: Record<string, number> = {
      "1-month": 1,
      "3-months": 3,
      "6-months": 6,
      "12-months": 12,
    };

    const durationMonths =
      typeof plan === "string" ? durationMap[plan] : undefined;

    if (!durationMonths) {
      return NextResponse.json(
        { error: "Durasi langganan tidak valid." },
        { status: 400 }
      );
    }

    const serviceKeys = SERVICE_BUNDLES[selected[0]]
      ? SERVICE_BUNDLES[selected[0]]
      : selected;

    const monthlyPrice =
      selected[0] === "all-in-one"
        ? 229000
        : serviceKeys.reduce(
            (total, key) => total + SERVICE_PRICES[key],
            0
          );

    const discountPercent = DURATION_DISCOUNTS[durationMonths];
    const subtotal = monthlyPrice * durationMonths;
    const discountAmount = Math.round(
      subtotal * discountPercent / 100
    );
    const totalAmount = subtotal - discountAmount;

    const planCode =
      selected[0] === "all-in-one"
        ? "ALL_IN_ONE"
        : serviceKeys.map((key) => key.toUpperCase()).join("_");

    const pendingCount = await prisma.planSubscription.count({
      where: {
        merchantId: merchant.id,
        status: "PENDING",
      },
    });

    if (pendingCount >= 5) {
      return NextResponse.json(
        { error: "Terlalu banyak pesanan menunggu pembayaran. Selesaikan atau batalkan pesanan sebelumnya." },
        { status: 429 }
      );
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const subscription = await prisma.planSubscription.create({
      data: {
        merchantId: merchant.id,
        planCode,
        durationMonths,
        status: "PENDING",
        amount: totalAmount,
        currency: "IDR",
        items: {
          create: serviceKeys.map((serviceKey) => ({
            serviceKey,
            connectionLimit: 1,
          })),
        },
        payments: {
          create: {
            provider: "DEMO",
            status: "PENDING",
            amount: totalAmount,
            currency: "IDR",
            expiresAt,
          },
        },
      },
      include: {
        items: true,
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
            expiresAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Pesanan langganan berhasil dibuat.",
        subscription,
        pricing: {
          monthlyPrice,
          subtotal,
          discountPercent,
          discountAmount,
          totalAmount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create subscription error:", error);

    return NextResponse.json(
      { error: "Gagal membuat pesanan langganan." },
      { status: 500 }
    );
  }
}
