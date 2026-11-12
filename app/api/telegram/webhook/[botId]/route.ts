import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { processTelegramUpdate } from "@/lib/bot-commands";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    botId: string;
  };
};

function verifySecret(
  received: string | null,
  expected: string
): boolean {
  if (!received) {
    return false;
  }

  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const bot = await prisma.bot.findUnique({
      where: {
        id: params.botId,
      },
      select: {
        id: true,
        webhookSecret: true,
      },
    });

    if (!bot) {
      return NextResponse.json(
        { error: "Bot tidak ditemukan." },
        { status: 404 }
      );
    }

    const receivedSecret = request.headers.get(
      "x-telegram-bot-api-secret-token"
    );

    if (!verifySecret(receivedSecret, bot.webhookSecret)) {
      return NextResponse.json(
        { error: "Webhook secret tidak valid." },
        { status: 401 }
      );
    }

    const rawPayload = await request.text();

    if (
      !rawPayload ||
      Buffer.byteLength(rawPayload, "utf8") > 1024 * 1024
    ) {
      return NextResponse.json(
        { error: "Payload kosong atau terlalu besar." },
        { status: 400 }
      );
    }

    let payload: Record<string, unknown>;

    try {
      const parsed: unknown = JSON.parse(rawPayload);

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new Error("Payload bukan object.");
      }

      payload = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Format JSON tidak valid." },
        { status: 400 }
      );
    }

    const updateId = payload.update_id;

    if (
      typeof updateId !== "number" ||
      !Number.isSafeInteger(updateId) ||
      updateId < 0
    ) {
      return NextResponse.json(
        { error: "Update ID tidak valid." },
        { status: 400 }
      );
    }

    try {
      await prisma.telegramUpdate.create({
        data: {
          botId: bot.id,
          updateId,
          updateType: payload.message
            ? "message"
            : payload.callback_query
              ? "callback_query"
              : "other",
          rawPayload,
          processed: false,
        },
      });
    } catch (error) {
      const isDuplicate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002";

      if (!isDuplicate) {
        throw error;
      }
    }

    const result = await processTelegramUpdate(bot.id, updateId);

    if (result === "processing") {
      return NextResponse.json(
        {
          ok: false,
          received: true,
          status: "processing",
          processed: false,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      received: true,
      status: result,
      processed: true,
    });
  } catch (error) {
    console.error("Telegram webhook processing failed:", error);

    return NextResponse.json(
      { error: "Gagal memproses webhook." },
      { status: 500 }
    );
  }
}
