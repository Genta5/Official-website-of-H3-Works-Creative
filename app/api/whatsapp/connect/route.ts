import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { encryptToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GRAPH_VERSION =
  process.env.META_GRAPH_API_VERSION || "v27.0";

type GraphResponse = {
  id?: string;
  display_phone_number?: string;
  verified_name?: string;
  data?: {
    app_id?: string;
    is_valid?: boolean;
    scopes?: string[];
  };
  error?: {
    message?: string;
    code?: number;
  };
};

type GraphListResponse = {
  data?: Array<{
    id?: string;
    display_phone_number?: string;
    verified_name?: string;
  }>;
  error?: {
    message?: string;
    code?: number;
  };
};

function hashVerifyToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

async function graphRequest<T = GraphResponse>(
  url: string,
  accessToken: string
): Promise<{
  ok: boolean;
  data: T;
}> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = (await response.json()) as T;

  return {
    ok: response.ok,
    data,
  };
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

    const now = new Date();

    const whatsappEntitlement = await prisma.planSubscription.findFirst({
      where: {
        merchantId: merchant.id,
        status: "ACTIVE",
        startsAt: { lte: now },
        endsAt: { gt: now },
        items: {
          some: {
            serviceKey: { in: ["whatsapp", "WHATSAPP"] },
          },
        },
      },
      include: {
        items: {
          where: {
            serviceKey: { in: ["whatsapp", "WHATSAPP"] },
          },
        },
      },
      orderBy: { endsAt: "desc" },
    });

    if (!whatsappEntitlement) {
      return NextResponse.json(
        { error: "Paket WhatsApp Bot belum aktif. Silakan berlangganan terlebih dahulu." },
        { status: 403 }
      );
    }

    const whatsappConnectionCount = await prisma.platformConnection.count({
      where: {
        merchantId: merchant.id,
        platform: "WHATSAPP",
      },
    });

    const whatsappConnectionLimit =
      whatsappEntitlement.items[0]?.connectionLimit ?? 0;

    if (whatsappConnectionCount >= whatsappConnectionLimit) {
      return NextResponse.json(
        { error: "Batas koneksi WhatsApp pada paket kamu sudah tercapai." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const appId =
      typeof body.appId === "string"
        ? body.appId.trim()
        : "";

    const appSecret =
      typeof body.appSecret === "string"
        ? body.appSecret.trim()
        : "";

    const wabaId =
      typeof body.wabaId === "string"
        ? body.wabaId.trim()
        : "";

    const phoneNumberId =
      typeof body.phoneNumberId === "string"
        ? body.phoneNumberId.trim()
        : "";

    const accessToken =
      typeof body.accessToken === "string"
        ? body.accessToken.trim()
        : "";

    if (
      !name ||
      !appId ||
      !appSecret ||
      !wabaId ||
      !phoneNumberId ||
      !accessToken
    ) {
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

    if (
      !/^\d+$/.test(appId) ||
      !/^\d+$/.test(wabaId) ||
      !/^\d+$/.test(phoneNumberId) ||
      appSecret.length < 16 ||
      accessToken.length < 20
    ) {
      return NextResponse.json(
        { error: "Format kredensial Meta tidak valid." },
        { status: 400 }
      );
    }

    // Periksa apakah nomor sudah digunakan koneksi lain.
    const existing =
      await prisma.platformConnection.findFirst({
        where: {
          platform: "WHATSAPP",
          externalId: phoneNumberId,
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tersebut sudah terdaftar." },
        { status: 409 }
      );
    }

    // Validasi Access Token terhadap aplikasi Meta.
    const debugUrl = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/debug_token`
    );

    debugUrl.searchParams.set("input_token", accessToken);

    const debugResult = await graphRequest(
      debugUrl.toString(),
      `${appId}|${appSecret}`
    );

    const tokenData = debugResult.data.data;

    if (
      !debugResult.ok ||
      !tokenData?.is_valid ||
      tokenData.app_id !== appId
    ) {
      return NextResponse.json(
        {
          error:
            "Access Token tidak valid atau tidak cocok dengan Meta App.",
        },
        { status: 400 }
      );
    }

    const scopes = tokenData.scopes || [];

    const requiredScopes = [
      "whatsapp_business_management",
      "whatsapp_business_messaging",
    ];

    const missingScopes = requiredScopes.filter(
      (scope) => !scopes.includes(scope)
    );

    if (missingScopes.length > 0) {
      return NextResponse.json(
        {
          error:
            "Access Token belum memiliki izin WhatsApp yang diperlukan.",
          missingScopes,
        },
        { status: 403 }
      );
    }

    // Validasi Phone Number ID.
    const phoneResult = await graphRequest(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}?fields=id,display_phone_number,verified_name`,
      accessToken
    );

    if (
      !phoneResult.ok ||
      phoneResult.data.id !== phoneNumberId
    ) {
      return NextResponse.json(
        {
          error:
            "Phone Number ID tidak ditemukan atau tidak dapat diakses.",
        },
        { status: 400 }
      );
    }

    // Pastikan nomor benar-benar milik WABA tersebut.
    const wabaResult = await graphRequest<GraphListResponse>(
      `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name&limit=100`,
      accessToken
    );

    if (!wabaResult.ok) {
      return NextResponse.json(
        {
          error:
            "WABA ID tidak ditemukan atau Access Token tidak memiliki akses.",
        },
        { status: 400 }
      );
    }

    const belongsToWaba =
      wabaResult.data.data?.some(
        (phone) => phone.id === phoneNumberId
      ) ?? false;

    if (!belongsToWaba) {
      return NextResponse.json(
        {
          error:
            "Phone Number ID tidak cocok dengan WhatsApp Business Account ID.",
        },
        { status: 400 }
      );
    }

    // Buat Verify Token unik untuk koneksi ini.
    const verifyToken = randomBytes(32).toString("hex");

    // Semua kredensial rahasia disimpan terenkripsi.
    const encryptedCredentials = encryptToken(
      JSON.stringify({
        appId,
        appSecret,
        wabaId,
        accessToken,
      })
    );

    const connection =
      await prisma.platformConnection.create({
        data: {
          merchantId: merchant.id,
          platform: "WHATSAPP",
          name,
          externalId: phoneNumberId,
          username:
            phoneResult.data.display_phone_number || null,
          encryptedCredentials,
          webhookSecret: hashVerifyToken(verifyToken),
          status: "pending_webhook",
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

    const appUrl = process.env.APP_URL?.replace(/\/+$/, "");

    const callbackUrl =
      appUrl?.startsWith("https://")
        ? `${appUrl}/api/whatsapp/webhook/${connection.id}`
        : null;

    return NextResponse.json(
      {
        message:
          "Kredensial berhasil divalidasi dan koneksi disimpan.",
        connection,
        callbackUrl,
        verifyToken,
        nextStep:
          "Konfigurasikan Callback URL dan Verify Token di Meta Developer.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("WhatsApp connect error:", error);

    return NextResponse.json(
      {
        error:
          "Gagal memproses koneksi WhatsApp. Periksa konfigurasi server.",
      },
      { status: 500 }
    );
  }
}
