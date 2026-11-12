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
  messages?: Array<{
    id?: string;
  }>;
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

    const recipient =
      typeof body.to === "string"
        ? body.to.replace(/\D/g, "")
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!connectionId || !recipient || !message) {
      return NextResponse.json(
        {
          error:
            "Connection ID, nomor tujuan, dan pesan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{8,15}$/.test(recipient)) {
      return NextResponse.json(
        {
          error:
            "Format nomor tujuan tidak valid. Gunakan kode negara tanpa tanda +.",
        },
        { status: 400 }
      );
    }

    if (message.length > 4096) {
      return NextResponse.json(
        { error: "Pesan maksimal 4096 karakter." },
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
          merchantId: true,
          externalId: true,
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
        { error: "Koneksi WhatsApp belum aktif." },
        { status: 400 }
      );
    }

    if (
      !connection.externalId ||
      !connection.encryptedCredentials
    ) {
      return NextResponse.json(
        { error: "Data kredensial koneksi tidak lengkap." },
        { status: 400 }
      );
    }

    const credentials = JSON.parse(
      decryptToken(connection.encryptedCredentials)
    ) as Credentials;

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${connection.externalId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );

    const result =
      (await response.json()) as MetaResponse;

    if (!response.ok) {
      console.error(
        "WhatsApp Meta API error:",
        result.error?.code || "unknown",
        result.error?.message || "Unknown error"
      );

      return NextResponse.json(
        {
          error:
            result.error?.message ||
            "Meta gagal menerima permintaan pengiriman pesan.",
        },
        { status: response.status }
      );
    }

    const messageId = result.messages?.[0]?.id;

    if (!messageId) {
      return NextResponse.json(
        {
          error:
            "Meta menerima respons, tetapi ID pesan tidak ditemukan.",
        },
        { status: 502 }
      );
    }

    // Cari atau buat identitas pelanggan WhatsApp.
    const customer = await prisma.customer.upsert({
      where: {
        merchantId_whatsappId: {
          merchantId: merchant.id,
          whatsappId: recipient,
        },
      },
      create: {
        merchantId: merchant.id,
        whatsappId: recipient,
        name: "Pelanggan WhatsApp",
      },
      update: {},
    });

    // Simpan pesan keluar. Upsert mencegah duplikasi ID Meta.
    await prisma.whatsAppMessage.upsert({
      where: {
        externalMessageId: messageId,
      },
      create: {
        platformConnectionId: connection.id,
        customerId: customer.id,
        externalMessageId: messageId,
        direction: "OUTBOUND",
        messageType: "text",
        content: message,
        status: "accepted",
        rawPayload: JSON.stringify(result),
      },
      update: {},
    });

    return NextResponse.json({
      success: true,
      message: "Pesan diterima oleh WhatsApp Cloud API dan riwayat berhasil disimpan.",
      messageId,
      customerId: customer.id,
      status: "accepted",
    });
  } catch (error) {
    console.error("WhatsApp send message error:", error);

    return NextResponse.json(
      {
        error:
          "Gagal mengirim atau menyimpan pesan. Periksa koneksi dan konfigurasi server.",
      },
      { status: 500 }
    );
  }
}
