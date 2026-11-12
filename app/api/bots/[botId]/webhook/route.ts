import "server-only";

import { request as httpsRequest } from "node:https";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    botId: string;
  };
};

function telegramSetWebhook(
  token: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; description?: string }> {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${token}/setWebhook`;
    const body = JSON.stringify(payload);

    const req = httpsRequest(
      url,
      {
        method: "POST",
        family: 4,
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let responseBody = "";

        res.setEncoding("utf8");

        res.on("data", (chunk: string) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          try {
            const data = JSON.parse(responseBody);

            if (res.statusCode && res.statusCode >= 400) {
              reject(
                new Error(
                  data.description || `Telegram HTTP ${res.statusCode}`
                )
              );
              return;
            }

            resolve(data);
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
    req.write(body);
    req.end();
  });
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const bot = await prisma.bot.findFirst({
      where: {
        id: params.botId,
        merchantId: merchant.id,
      },
      select: {
        id: true,
        encryptedToken: true,
        webhookSecret: true,
        platformConnectionId: true,
      },
    });

    if (!bot) {
      return NextResponse.json(
        { error: "Bot tidak ditemukan." },
        { status: 404 }
      );
    }

    const appUrl = process.env.APP_URL?.replace(/\/+$/, "");

    if (
      !appUrl ||
      !/^https:\/\/[^/\s]+$/i.test(appUrl) ||
      appUrl.includes("localhost")
    ) {
      return NextResponse.json(
        { error: "APP_URL harus menggunakan HTTPS publik." },
        { status: 500 }
      );
    }

    const webhookUrl = `${appUrl}/api/telegram/webhook/${bot.id}`;
    const token = decryptToken(bot.encryptedToken);

    const telegramData = await telegramSetWebhook(token, {
      url: webhookUrl,
      secret_token: bot.webhookSecret,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: false,
    });

    if (!telegramData.ok) {
      console.error(
        "Telegram webhook registration rejected:",
        telegramData.description || "Unknown Telegram API error"
      );

      return NextResponse.json(
        { error: "Telegram gagal memasang webhook." },
        { status: 502 }
      );
    }

    const connectedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.bot.update({
        where: { id: bot.id },
        data: {
          status: "connected",
          connectedAt,
        },
      });

      if (bot.platformConnectionId) {
        await tx.platformConnection.update({
          where: {
            id: bot.platformConnectionId,
          },
          data: {
            status: "connected",
            connectedAt,
          },
        });
      }
    });

    return NextResponse.json({
      message: "Webhook berhasil dipasang.",
      botId: bot.id,
      status: "connected",
    });
  } catch (error) {
    console.error("Webhook registration error:", error);

    return NextResponse.json(
      { error: "Gagal mendaftarkan webhook." },
      { status: 500 }
    );
  }
}
