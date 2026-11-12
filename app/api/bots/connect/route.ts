import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { get as httpsGet } from "node:https";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { encryptToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramGetMeResponse = {
  ok: boolean;
  result?: {
    id?: number;
    username?: string;
  };
};

function telegramGetMe(token: string): Promise<TelegramGetMeResponse> {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${token}/getMe`;

    const req = httpsGet(
      url,
      { family: 4, timeout: 10000 },
      (response) => {
        let body = "";

        response.setEncoding("utf8");
        response.on("data", (chunk: string) => {
          body += chunk;
        });

        response.on("end", () => {
          try {
            if (
              !response.statusCode ||
              response.statusCode < 200 ||
              response.statusCode >= 300
            ) {
              reject(new Error("Telegram API HTTP error."));
              return;
            }

            resolve(JSON.parse(body) as TelegramGetMeResponse);
          } catch {
            reject(new Error("Respons Telegram tidak valid."));
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Koneksi Telegram timeout."));
    });

    req.on("error", reject);
  });
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

    const telegramEntitlement = await prisma.planSubscription.findFirst({
      where: {
        merchantId: merchant.id,
        status: "ACTIVE",
        startsAt: { lte: now },
        endsAt: { gt: now },
        items: {
          some: {
            serviceKey: { in: ["telegram", "TELEGRAM"] },
          },
        },
      },
      include: {
        items: {
          where: {
            serviceKey: { in: ["telegram", "TELEGRAM"] },
          },
        },
      },
      orderBy: { endsAt: "desc" },
    });

    if (!telegramEntitlement) {
      return NextResponse.json(
        { error: "Paket Telegram Bot belum aktif. Silakan berlangganan terlebih dahulu." },
        { status: 403 }
      );
    }

    const telegramConnectionCount = await prisma.platformConnection.count({
      where: {
        merchantId: merchant.id,
        platform: "TELEGRAM",
      },
    });

    const telegramConnectionLimit =
      telegramEntitlement.items[0]?.connectionLimit ?? 0;

    if (telegramConnectionCount >= telegramConnectionLimit) {
      return NextResponse.json(
        { error: "Batas koneksi Telegram pada paket kamu sudah tercapai." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const token =
      typeof body.token === "string" ? body.token.trim() : "";

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    if (!token || token.length > 512) {
      return NextResponse.json(
        { error: "Token Telegram tidak valid." },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: "Nama bot harus terdiri dari 2–80 karakter." },
        { status: 400 }
      );
    }

    const telegramData = await telegramGetMe(token);

    if (
      !telegramData.ok ||
      !telegramData.result?.id ||
      !telegramData.result?.username
    ) {
      return NextResponse.json(
        { error: "Token Telegram tidak dapat diverifikasi." },
        { status: 400 }
      );
    }

    const telegramBotId = String(telegramData.result.id);
    const username = telegramData.result.username;

    const existingBot = await prisma.bot.findFirst({
      where: {
        OR: [{ username }, { telegramBotId }],
      },
      select: {
        id: true,
      },
    });

    if (existingBot) {
      return NextResponse.json(
        { error: "Bot ini sudah terhubung ke akun ORDERLY." },
        { status: 409 }
      );
    }

    const encryptedToken = encryptToken(token);
    const webhookSecret = randomBytes(32).toString("hex");

    const result = await prisma.$transaction(async (tx) => {
      const connection = await tx.platformConnection.create({
        data: {
          merchantId: merchant.id,
          platform: "TELEGRAM",
          name,
          externalId: telegramBotId,
          username,
          encryptedCredentials: encryptedToken,
          webhookSecret,
          status: "pending",
        },
        select: {
          id: true,
          platform: true,
          status: true,
        },
      });

      const bot = await tx.bot.create({
        data: {
          merchantId: merchant.id,
          name,
          username,
          telegramBotId,
          encryptedToken,
          webhookSecret,
          status: "pending",
          platformConnectionId: connection.id,
        },
        select: {
          id: true,
          name: true,
          username: true,
          status: true,
          createdAt: true,
        },
      });

      return { bot, connection };
    });

    return NextResponse.json(
      {
        message: "Bot berhasil diverifikasi dan disimpan.",
        bot: result.bot,
        connection: result.connection,
        nextStep: "Webhook registration",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bot connection error:", error);

    return NextResponse.json(
      { error: "Gagal menghubungkan bot." },
      { status: 500 }
    );
  }
}
