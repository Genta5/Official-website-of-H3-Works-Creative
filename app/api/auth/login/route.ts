import { NextRequest, NextResponse } from "next/server";
import {
  authenticateMerchant,
  createSession,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const merchant = await authenticateMerchant(email, password);

    if (!merchant) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    await createSession(merchant.id);

    return NextResponse.json({
      message: "Login berhasil.",
      merchant,
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
