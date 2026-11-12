import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { encryptToken, decryptToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIGIFLAZZ_URL = "https://api.digiflazz.com/v1/cek-saldo";

function createSignature(username: string, apiKey: string) {
  return createHash("md5")
    .update(`${username}${apiKey}depo`)
    .digest("hex");
}

async function checkDigiflazzBalance(
  username: string,
  apiKey: string
): Promise<number> {
  const response = await fetch(DIGIFLAZZ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cmd: "deposit",
      username,
      sign: createSignature(username, apiKey),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  const result = await response.json();

  const balance = Number(result?.data?.deposit);

  if (!response.ok || !Number.isFinite(balance) || balance < 0) {
    throw new Error("Kredensial tidak valid atau Digiflazz tidak merespons.");
  }

  return balance;
}

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const connection = await prisma.platformConnection.findFirst({
      where: {
        merchantId: merchant.id,
        platform: "DIGIFLAZZ",
      },
      select: {
        id: true,
        username: true,
        status: true,
        encryptedCredentials: true,
        connectedAt: true,
      },
    });

    if (
      !connection ||
      !connection.encryptedCredentials ||
      connection.status !== "connected"
    ) {
      return NextResponse.json({
        connected: false,
        username: "",
        balance: null,
      });
    }

    let balance: number | null = null;

    try {
      const credentials = JSON.parse(
        decryptToken(connection.encryptedCredentials)
      );

      balance = await checkDigiflazzBalance(
        credentials.username,
        credentials.apiKey
      );
    } catch (error) {
      console.error("Digiflazz balance check failed:", error);
    }

    return NextResponse.json({
      connected: true,
      username: connection.username || "",
      balance,
      connectedAt: connection.connectedAt,
    });
  } catch (error) {
    console.error("GET /api/digiflazz:", error);

    return NextResponse.json(
      { error: "Gagal mengambil status Digiflazz." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const username =
      typeof body.username === "string" ? body.username.trim() : "";
    const apiKey =
      typeof body.apiKey === "string" ? body.apiKey.trim() : "";

    if (
      !username ||
      !apiKey ||
      username.length > 200 ||
      apiKey.length > 500
    ) {
      return NextResponse.json(
        { error: "Username dan API Key wajib diisi dengan benar." },
        { status: 400 }
      );
    }

    // Verifikasi akun sebelum menyimpan kredensial.
    const balance = await checkDigiflazzBalance(username, apiKey);

    const encryptedCredentials = encryptToken(
      JSON.stringify({ username, apiKey })
    );

    const existing = await prisma.platformConnection.findFirst({
      where: {
        merchantId: merchant.id,
        platform: "DIGIFLAZZ",
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.platformConnection.update({
        where: { id: existing.id },
        data: {
          name: "Digiflazz",
          externalId: merchant.id,
          username,
          encryptedCredentials,
          status: "connected",
          connectedAt: new Date(),
        },
      });
    } else {
      await prisma.platformConnection.create({
        data: {
          merchantId: merchant.id,
          platform: "DIGIFLAZZ",
          name: "Digiflazz",
          externalId: merchant.id,
          username,
          encryptedCredentials,
          status: "connected",
          connectedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      connected: true,
      username,
      balance,
      message: "Akun Digiflazz berhasil terhubung.",
    });
  } catch (error) {
    console.error("POST /api/digiflazz:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghubungkan Digiflazz.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const connection = await prisma.platformConnection.findFirst({
      where: {
        merchantId: merchant.id,
        platform: "DIGIFLAZZ",
      },
      select: { id: true },
    });

    if (connection) {
      await prisma.platformConnection.update({
        where: { id: connection.id },
        data: {
          status: "disconnected",
          encryptedCredentials: null,
          username: null,
          connectedAt: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      connected: false,
      message: "Koneksi Digiflazz berhasil diputuskan.",
    });
  } catch (error) {
    console.error("DELETE /api/digiflazz:", error);

    return NextResponse.json(
      { error: "Gagal memutuskan koneksi Digiflazz." },
      { status: 500 }
    );
  }
}
