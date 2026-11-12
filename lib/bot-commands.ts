import "server-only";

import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/crypto";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as JsonObject;
  }

  return null;
}

async function sendTelegramMessage(
  token: string,
  chatId: number,
  message: string
) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error("Telegram gagal mengirim pesan.");
  }
}

function formatRupiah(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export type TelegramUpdateResult =
  | "processed"
  | "already_processed"
  | "processing";

export async function processTelegramUpdate(
  botId: string,
  updateId: number
): Promise<TelegramUpdateResult> {
  const existing = await prisma.telegramUpdate.findUnique({
    where: {
      botId_updateId: {
        botId,
        updateId,
      },
    },
    select: {
      processed: true,
    },
  });

  if (!existing) {
    throw new Error("Telegram update tidak ditemukan.");
  }

  if (existing.processed) {
    return "already_processed";
  }

  const claimedAt = new Date();
  const staleBefore = new Date(Date.now() - 5 * 60 * 1000);

  const claim = await prisma.telegramUpdate.updateMany({
    where: {
      botId,
      updateId,
      processed: false,
      OR: [
        { processingAt: null },
        { processingAt: { lt: staleBefore } },
      ],
    },
    data: {
      processingAt: claimedAt,
    },
  });

  if (claim.count !== 1) {
    return "processing";
  }

  const markProcessed = async () => {
    const result = await prisma.telegramUpdate.updateMany({
      where: {
        botId,
        updateId,
        processed: false,
        processingAt: claimedAt,
      },
      data: {
        processed: true,
        processedAt: new Date(),
        processingAt: null,
      },
    });

    return result.count === 1;
  };

  try {
    const update = await prisma.telegramUpdate.findUnique({
      where: {
        botId_updateId: {
          botId,
          updateId,
        },
      },
      include: {
        bot: {
          include: {
            merchant: true,
          },
        },
      },
    });

    if (
      !update ||
      update.processed ||
      !update.processingAt ||
      update.processingAt.getTime() !== claimedAt.getTime()
    ) {
      return "processing";
    }

    if (update.bot.status !== "connected") {
      throw new Error(
        "Bot belum terhubung. Telegram update perlu dicoba ulang."
      );
    }

    const payload = asObject(JSON.parse(update.rawPayload));

    if (!payload) {
      throw new Error("Payload Telegram tidak valid.");
    }

    const message = asObject(payload.message);

    if (!message) {
      return (await markProcessed()) ? "processed" : "processing";
    }

    const chat = asObject(message.chat);
    const sender = asObject(message.from);

    if (
      !chat ||
      typeof chat.id !== "number" ||
      !Number.isSafeInteger(chat.id)
    ) {
      return (await markProcessed()) ? "processed" : "processing";
    }

    const chatId = chat.id;

    if (
      sender &&
      typeof sender.id === "number" &&
      Number.isSafeInteger(sender.id) &&
      sender.is_bot !== true
    ) {
      const telegramUserId = String(sender.id);

      const firstName =
        typeof sender.first_name === "string"
          ? sender.first_name
          : "";

      const lastName =
        typeof sender.last_name === "string"
          ? sender.last_name
          : "";

      const name =
        `${firstName} ${lastName}`.trim() ||
        (typeof sender.username === "string"
          ? sender.username
          : "Pelanggan Telegram");

      const username =
        typeof sender.username === "string"
          ? sender.username
          : null;

      await prisma.customer.upsert({
        where: {
          merchantId_telegramUserId: {
            merchantId: update.bot.merchantId,
            telegramUserId,
          },
        },
        create: {
          merchantId: update.bot.merchantId,
          telegramUserId,
          username,
          name,
        },
        update: {
          username,
          name,
        },
      });
    }

    const text =
      typeof message.text === "string"
        ? message.text.trim()
        : "";

    if (!text.startsWith("/")) {
      return (await markProcessed()) ? "processed" : "processing";
    }

    const command = text
      .split(/\s+/)[0]
      .split("@")[0]
      .toLowerCase();

    const token = decryptToken(update.bot.encryptedToken);
    const storeName = update.bot.merchant.name;

    if (command === "/start") {
      await sendTelegramMessage(
        token,
        chatId,
        `Halo! Selamat datang di ${storeName}.\n\n` +
          "Silakan gunakan perintah berikut:\n" +
          "/catalog - Lihat katalog produk\n" +
          "/help - Bantuan"
      );
    } else if (command === "/help") {
      await sendTelegramMessage(
        token,
        chatId,
        `Bantuan ${storeName}\n\n` +
          "/start - Mulai menggunakan bot\n" +
          "/catalog - Lihat katalog produk\n" +
          "/help - Tampilkan bantuan"
      );
    } else if (command === "/catalog") {
      const products = await prisma.product.findMany({
        where: {
          merchantId: update.bot.merchantId,
          status: "active",
        },
        select: {
          name: true,
          price: true,
          stock: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 15,
      });

      if (products.length === 0) {
        await sendTelegramMessage(
          token,
          chatId,
          `Katalog ${storeName} belum memiliki produk aktif.`
        );
      } else {
        const productList = products.map((product, index) => {
          const stockText =
            product.stock > 0
              ? `Stok: ${product.stock}`
              : "Stok habis";

          return (
            `${index + 1}. ${product.name.slice(0, 100)}\n` +
            `${formatRupiah(product.price)}\n` +
            stockText
          );
        });

        await sendTelegramMessage(
          token,
          chatId,
          `KATALOG ${storeName}\n\n` +
            productList.join("\n\n")
        );
      }
    } else {
      await sendTelegramMessage(
        token,
        chatId,
        "Perintah belum dikenali. Ketik /help untuk melihat bantuan."
      );
    }

    return (await markProcessed()) ? "processed" : "processing";
  } catch (error) {
    await prisma.telegramUpdate.updateMany({
      where: {
        botId,
        updateId,
        processed: false,
        processingAt: claimedAt,
      },
      data: {
        processingAt: null,
      },
    });

    throw error;
  }
}
