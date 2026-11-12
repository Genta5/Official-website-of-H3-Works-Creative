import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  createSession,
  registerMerchant,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (process.env.ALLOW_PUBLIC_REGISTRATION !== "true") {
      return NextResponse.json(
        { error: "Pendaftaran ORDERLY saat ini ditutup. Hubungi H3 Works untuk informasi akses beta." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: "Nama harus terdiri dari 2–80 karakter." },
        { status: 400 }
      );
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 12 || password.length > 128) {
      return NextResponse.json(
        { error: "Password harus terdiri dari 12–128 karakter." },
        { status: 400 }
      );
    }

    const merchant = await registerMerchant({
      name,
      email,
      password,
    });

    await createSession(merchant.id);

    return NextResponse.json(
      {
        message: "Akun berhasil dibuat.",
        merchant,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    console.error("Register error:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
