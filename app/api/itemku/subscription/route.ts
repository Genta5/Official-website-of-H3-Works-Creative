import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLAN = {
  key: "STARTER",
  maxProducts: 20,
  maxOrdersPerMonth: 100,
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

    const subscription =
      await prisma.itemkuSubscription.findUnique({
        where: { merchantId: merchant.id },
      });

    const now = new Date();

    const active =
      subscription?.status === "ACTIVE" &&
      !!subscription.endsAt &&
      subscription.endsAt > now;

    return NextResponse.json({
      subscription: subscription
        ? {
            id: subscription.id,
            planKey: subscription.planKey,
            status: subscription.status,
            startsAt: subscription.startsAt,
            endsAt: subscription.endsAt,
            amount: subscription.amount,
            currency: subscription.currency,
            maxProducts: subscription.maxProducts,
            maxOrdersPerMonth: subscription.maxOrdersPerMonth,
            active,
          }
        : null,
      availablePlan: PLAN,
    });
  } catch (error) {
    console.error("GET /api/itemku/subscription:", error);

    return NextResponse.json(
      { error: "Gagal mengambil subscription Itemku." },
      { status: 500 }
    );
  }
}

// Aktivasi sementara hanya untuk pengujian internal.
// Jangan membuka endpoint ini sebagai pembelian publik.
export async function POST(request: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Aktivasi pengujian tidak tersedia di production." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));

    if (body.action !== "activate_test") {
      return NextResponse.json(
        {
          error:
            "Aktivasi berbayar belum tersedia. Gunakan aktivasi pengujian internal.",
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + 30);

    const subscription =
      await prisma.itemkuSubscription.upsert({
        where: { merchantId: merchant.id },
        create: {
          merchantId: merchant.id,
          planKey: PLAN.key,
          status: "ACTIVE",
          startsAt: now,
          endsAt,
          amount: 0,
          currency: "IDR",
          maxProducts: PLAN.maxProducts,
          maxOrdersPerMonth: PLAN.maxOrdersPerMonth,
        },
        update: {
          planKey: PLAN.key,
          status: "ACTIVE",
          startsAt: now,
          endsAt,
          amount: 0,
          currency: "IDR",
          maxProducts: PLAN.maxProducts,
          maxOrdersPerMonth: PLAN.maxOrdersPerMonth,
        },
      });

    return NextResponse.json({
      success: true,
      subscription,
      message: "Subscription pengujian aktif selama 30 hari.",
    });
  } catch (error) {
    console.error("POST /api/itemku/subscription:", error);

    return NextResponse.json(
      { error: "Gagal mengaktifkan subscription pengujian." },
      { status: 500 }
    );
  }
}
