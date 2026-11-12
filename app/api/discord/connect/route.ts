import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { encryptToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DiscordApplication = {
  id?: string;
  name?: string;
  bot?: {
    id?: string;
    username?: string;
  };
};

type DiscordUser = {
  id?: string;
  username?: string;
  global_name?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (!Number.isFinite(contentLength) || contentLength < 0) {
      return NextResponse.json(
        { error: "Header ukuran request tidak valid." },
        { status: 400 }
      );
    }

    if (contentLength > 16 * 1024) {
      return NextResponse.json(
        { error: "Payload terlalu besar." },
        { status: 413 }
      );
    }

    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const now = new Date();

    const discordEntitlement = await prisma.planSubscription.findFirst({
      where: {
        merchantId: merchant.id,
        status: "ACTIVE",
        startsAt: { lte: now },
        endsAt: { gt: now },
        items: {
          some: {
            serviceKey: { in: ["discord", "DISCORD"] },
          },
        },
      },
      include: {
        items: {
          where: {
            serviceKey: { in: ["discord", "DISCORD"] },
          },
        },
      },
      orderBy: { endsAt: "desc" },
    });

    if (!discordEntitlement) {
      return NextResponse.json(
        { error: "Paket Discord Bot belum aktif. Silakan berlangganan terlebih dahulu." },
        { status: 403 }
      );
    }

    const discordConnectionCount = await prisma.platformConnection.count({
      where: {
        merchantId: merchant.id,
        platform: "DISCORD",
      },
    });

    const discordConnectionLimit =
      discordEntitlement.items[0]?.connectionLimit ?? 0;

    if (discordConnectionCount >= discordConnectionLimit) {
      return NextResponse.json(
        { error: "Batas koneksi Discord pada paket kamu sudah tercapai." },
        { status: 403 }
      );
    }

    let body: unknown;

    try {
      const rawBody = await request.text();

      if (Buffer.byteLength(rawBody, "utf8") > 16 * 1024) {
        return NextResponse.json(
          { error: "Payload terlalu besar." },
          { status: 413 }
        );
      }

      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Format JSON request tidak valid." },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Payload request harus berupa objek JSON." },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;

    const name =
      typeof payload.name === "string" ? payload.name.trim() : "";

    const applicationId =
      typeof payload.applicationId === "string"
        ? payload.applicationId.trim()
        : "";

    const publicKey =
      typeof payload.publicKey === "string"
        ? payload.publicKey.trim().toLowerCase()
        : "";

    const botToken =
      typeof payload.botToken === "string"
        ? payload.botToken.trim()
        : "";

    if (!name || !applicationId || !publicKey || !botToken) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    if (name.length > 80) {
      return NextResponse.json(
        { error: "Nama koneksi maksimal 80 karakter." },
        { status: 400 }
      );
    }

    if (!/^\d{17,20}$/.test(applicationId)) {
      return NextResponse.json(
        { error: "Application ID Discord tidak valid." },
        { status: 400 }
      );
    }

    if (!/^[a-f0-9]{64}$/.test(publicKey)) {
      return NextResponse.json(
        { error: "Public Key harus terdiri dari 64 karakter hexadecimal." },
        { status: 400 }
      );
    }

    if (botToken.length < 30 || botToken.length > 512) {
      return NextResponse.json(
        { error: "Format Bot Token Discord tidak valid." },
        { status: 400 }
      );
    }

    const existing = await prisma.platformConnection.findFirst({
      where: {
        platform: "DISCORD",
        externalId: applicationId,
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Discord Application ID tersebut sudah terdaftar." },
        { status: 409 }
      );
    }

    // Validasi token menggunakan endpoint resmi Discord.
    const discordResponse = await fetch(
      "https://discord.com/api/v10/oauth2/applications/@me",
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${botToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!discordResponse.ok) {
      return NextResponse.json(
        { error: "Bot Token tidak valid atau tidak dapat mengakses aplikasi Discord." },
        { status: 400 }
      );
    }

    let applicationPayload: unknown;

    try {
      applicationPayload = await discordResponse.json();
    } catch {
      return NextResponse.json(
        { error: "Respons aplikasi Discord bukan JSON valid." },
        { status: 502 }
      );
    }

    if (
      !applicationPayload ||
      typeof applicationPayload !== "object" ||
      Array.isArray(applicationPayload)
    ) {
      return NextResponse.json(
        { error: "Format respons aplikasi Discord tidak valid." },
        { status: 502 }
      );
    }

    const application = applicationPayload as DiscordApplication;

    if (
      typeof application.id !== "string" ||
      typeof application.bot?.id !== "string"
    ) {
      return NextResponse.json(
        { error: "Identitas aplikasi atau bot Discord tidak lengkap." },
        { status: 502 }
      );
    }

    if (application.id !== applicationId) {
      return NextResponse.json(
        { error: "Application ID tidak cocok dengan Bot Token." },
        { status: 400 }
      );
    }

    // Ambil identitas bot untuk ditampilkan di dashboard.
    const botResponse = await fetch(
      "https://discord.com/api/v10/users/@me",
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${botToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!botResponse.ok) {
      return NextResponse.json(
        { error: "Identitas bot Discord gagal diverifikasi." },
        { status: 400 }
      );
    }

    let botPayload: unknown;

    try {
      botPayload = await botResponse.json();
    } catch {
      return NextResponse.json(
        { error: "Respons identitas bot Discord bukan JSON valid." },
        { status: 502 }
      );
    }

    if (
      !botPayload ||
      typeof botPayload !== "object" ||
      Array.isArray(botPayload)
    ) {
      return NextResponse.json(
        { error: "Format respons identitas bot Discord tidak valid." },
        { status: 502 }
      );
    }

    const bot = botPayload as DiscordUser;

    if (
      typeof bot.id !== "string" ||
      typeof bot.username !== "string" ||
      application.bot.id !== bot.id
    ) {
      return NextResponse.json(
        { error: "Identitas bot tidak cocok dengan Discord Application." },
        { status: 400 }
      );
    }

    const encryptedCredentials = encryptToken(
      JSON.stringify({ botToken })
    );

    const connection = await prisma.platformConnection.create({
      data: {
        merchantId: merchant.id,
        platform: "DISCORD",
        name,
        externalId: applicationId,
        username: bot.username || application.name || "Discord Bot",
        encryptedCredentials,
        discordPublicKey: publicKey,
        status: "pending",
      },
      select: {
        id: true,
        platform: true,
        name: true,
        externalId: true,
        username: true,
        status: true,
        createdAt: true,
      },
    });

    const inviteUrl = new URL(
      "https://discord.com/oauth2/authorize"
    );

    inviteUrl.searchParams.set("client_id", applicationId);
    inviteUrl.searchParams.set("scope", "bot applications.commands");
    inviteUrl.searchParams.set("permissions", "3072");

    return NextResponse.json(
      {
        success: true,
        message: "Bot Discord berhasil divalidasi dan disimpan.",
        connection,
        inviteUrl: inviteUrl.toString(),
        nextStep: "Undang bot ke server Discord, lalu daftarkan Interactions Endpoint URL.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Discord Application ID tersebut sudah terdaftar." },
        { status: 409 }
      );
    }

    console.error("Discord connect error:", error);

    return NextResponse.json(
      { error: "Gagal menghubungkan bot Discord." },
      { status: 500 }
    );
  }
}
