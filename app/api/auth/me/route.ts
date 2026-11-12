import { NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      merchant,
    });
  } catch (error) {
    console.error("Session check error:", error);

    return NextResponse.json(
      { error: "Gagal memeriksa sesi." },
      { status: 500 }
    );
  }
}
