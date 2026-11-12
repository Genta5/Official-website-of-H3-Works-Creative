import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DiscordCommand = {
  id: string;
  name: string;
};

const COMMAND = {
  name: "orderly",
  description: "Periksa status integrasi ORDERLY.",
  type: 1,
};

export async function POST(request: NextRequest) {
  try {
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
    });

    if (!discordEntitlement) {
      return NextResponse.json(
        { error: "Paket Discord Bot belum aktif. Silakan berlangganan terlebih dahulu." },
        { status: 403 }
      );
    }

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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Payload request harus berupa objek JSON." },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;
    const connectionId =
      typeof payload.connectionId === "string"
        ? payload.connectionId.trim()
        : "";

    if (!connectionId) {
      return NextResponse.json(
        { error: "ID koneksi Discord wajib diisi." },
        { status: 400 }
      );
    }

    const connection = await prisma.platformConnection.findFirst({
      where: {
        id: connectionId,
        merchantId: merchant.id,
        platform: "DISCORD",
      },
      select: {
        id: true,
        externalId: true,
        encryptedCredentials: true,
        status: true,
      },
    });

    if (!connection || !connection.externalId || !connection.encryptedCredentials) {
      return NextResponse.json(
        { error: "Koneksi Discord tidak ditemukan." },
        { status: 404 }
      );
    }

    let credentials: { botToken: string };

    try {
      const decrypted: unknown = JSON.parse(
        decryptToken(connection.encryptedCredentials)
      );

      if (
        !decrypted ||
        typeof decrypted !== "object" ||
        Array.isArray(decrypted)
      ) {
        throw new Error("Invalid credential structure.");
      }

      const botToken = (decrypted as Record<string, unknown>).botToken;

      if (
        typeof botToken !== "string" ||
        botToken.length < 30 ||
        botToken.length > 512
      ) {
        throw new Error("Invalid bot token format.");
      }

      credentials = { botToken };
    } catch {
      return NextResponse.json(
        { error: "Kredensial Discord tersimpan tidak valid." },
        { status: 500 }
      );
    }

    const apiUrl =
      `https://discord.com/api/v10/applications/` +
      `${connection.externalId}/commands`;

    const headers = {
      Authorization: `Bot ${credentials.botToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Ambil command yang sudah terdaftar agar command lain tetap aman.
    const listResponse = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!listResponse.ok) {
      return NextResponse.json(
        { error: "Gagal membaca Slash Command dari Discord." },
        { status: 502 }
      );
    }

    let commandPayload: unknown;

    try {
      commandPayload = await listResponse.json();
    } catch {
      return NextResponse.json(
        { error: "Respons daftar Slash Command dari Discord bukan JSON valid." },
        { status: 502 }
      );
    }

    if (
      !Array.isArray(commandPayload) ||
      !commandPayload.every(
        (command): command is DiscordCommand =>
          !!command &&
          typeof command === "object" &&
          !Array.isArray(command) &&
          typeof command.id === "string" &&
          /^\d{17,20}$/.test(command.id) &&
          typeof command.name === "string" &&
          command.name.length >= 1 &&
          command.name.length <= 32
      )
    ) {
      return NextResponse.json(
        { error: "Format daftar Slash Command dari Discord tidak valid." },
        { status: 502 }
      );
    }

    const existingCommands = commandPayload;

    const existing = existingCommands.find(
      (command) => command.name === COMMAND.name
    );

    const syncResponse = await fetch(
      existing
        ? `${apiUrl}/${existing.id}`
        : apiUrl,
      {
        method: existing ? "PATCH" : "POST",
        headers,
        body: JSON.stringify(COMMAND),
        cache: "no-store",
      signal: AbortSignal.timeout(15000),
      }
    );

    let result: unknown = null;

    try {
      result = await syncResponse.json();
    } catch {
      return NextResponse.json(
        { error: "Respons sinkronisasi Slash Command bukan JSON valid." },
        { status: 502 }
      );
    }

    if (!syncResponse.ok) {
      const details =
        result &&
        typeof result === "object" &&
        !Array.isArray(result) &&
        "message" in result &&
        typeof result.message === "string"
          ? result.message
          : "Discord API mengembalikan kesalahan.";

      return NextResponse.json(
        {
          error: "Discord gagal mendaftarkan Slash Command.",
          details,
        },
        { status: 502 }
      );
    }

    if (
      !result ||
      typeof result !== "object" ||
      Array.isArray(result) ||
      !("id" in result) ||
      typeof result.id !== "string" ||
      !/^\\d{17,20}$/.test(result.id) ||
      !("name" in result) ||
      result.name !== COMMAND.name
    ) {
      return NextResponse.json(
        { error: "Identitas Slash Command dari Discord tidak valid." },
        { status: 502 }
      );
    }

    await prisma.platformConnection.update({
      where: { id: connection.id },
      data: { status: "pending" },
    });

    return NextResponse.json({
      success: true,
      message: "Slash Command /orderly berhasil disinkronkan.",
      command: COMMAND.name,
      status: "pending",
      nextStep: "Konfigurasikan Interactions Endpoint URL pada Discord Developer Portal.",
    });
  } catch (error) {
    console.error("Discord sync error:", error);

    return NextResponse.json(
      { error: "Gagal menyinkronkan Discord." },
      { status: 500 }
    );
  }
}
