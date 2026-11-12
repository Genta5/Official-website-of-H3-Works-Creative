import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GRAPH_VERSION =
  process.env.META_GRAPH_API_VERSION || "v27.0";

type Credentials = {
  appId: string;
  appSecret: string;
  wabaId: string;
  accessToken: string;
};

type MetaResponse = {
  success?: boolean;
  error?: {
    message?: string;
    code?: number;
  };
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

    const body = await request.json();

    const connectionId =
      typeof body.connectionId === "string"
        ? body.connectionId.trim()
        : "";

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID wajib diisi." },
        { status: 400 }
      );
    }

    const connection =
      await prisma.platformConnection.findFirst({
        where: {
          id: connectionId,
          merchantId: merchant.id,
          platform: "WHATSAPP",
        },
        select: {
          id: true,
          status: true,
          encryptedCredentials: true,
        },
      });

    if (!connection) {
      return NextResponse.json(
        { error: "Koneksi WhatsApp tidak ditemukan." },
        { status: 404 }
      );
    }

    if (connection.status !== "connected") {
      return NextResponse.json(
        {
          error:
            "Webhook belum diverifikasi. Selesaikan verifikasi Callback URL terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    if (!connection.encryptedCredentials) {
      return NextResponse.json(
        { error: "Kredensial koneksi tidak ditemukan." },
        { status: 400 }
      );
    }

    const credentials = JSON.parse(
      decryptToken(connection.encryptedCredentials)
    ) as Credentials;

    if (!credentials.wabaId || !credentials.accessToken) {
      return NextResponse.json(
        { error: "Data WABA atau Access Token tidak lengkap." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${credentials.wabaId}/subscribed_apps`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );

    const result =
      (await response.json()) as MetaResponse;

    if (!response.ok || result.success !== true) {
      console.error(
        "WhatsApp WABA subscription error:",
        result.error?.code || "unknown",
        result.error?.message || "Unknown error"
      );

      return NextResponse.json(
        {
          error:
            result.error?.message ||
            "Meta gagal mendaftarkan aplikasi ke WABA.",
        },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Aplikasi Meta berhasil didaftarkan ke WhatsApp Business Account.",
      connectionId: connection.id,
      status: "connected",
    });
  } catch (error) {
    console.error("WhatsApp sync error:", error);

    return NextResponse.json(
      {
        error:
          "Gagal melakukan sinkronisasi WhatsApp. Periksa konfigurasi server.",
      },
      { status: 500 }
    );
  }
}
