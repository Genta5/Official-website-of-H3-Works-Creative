import { NextRequest, NextResponse } from "next/server";
import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "crypto";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Credentials = {
  appId: string;
  appSecret: string;
  wabaId: string;
  accessToken: string;
};

type RouteContext = {
  params: {
    connectionId: string;
  };
};

type JsonObject = {
  [key: string]: unknown;
};

function asObject(value: unknown): JsonObject | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as JsonObject;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getString(
  object: JsonObject | null,
  key: string
): string | null {
  const value = object?.[key];

  return typeof value === "string" && value.length > 0
    ? value
    : null;
}

function hashVerifyToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function safeCompareHex(a: string, b: string) {
  if (
    !/^[a-f0-9]{64}$/i.test(a) ||
    !/^[a-f0-9]{64}$/i.test(b)
  ) {
    return false;
  }

  const bufferA = Buffer.from(a, "hex");
  const bufferB = Buffer.from(b, "hex");

  return (
    bufferA.length === bufferB.length &&
    timingSafeEqual(bufferA, bufferB)
  );
}

async function getConnection(connectionId: string) {
  return prisma.platformConnection.findFirst({
    where: {
      id: connectionId,
      platform: "WHATSAPP",
    },
    select: {
      id: true,
      merchantId: true,
      externalId: true,
      status: true,
      webhookSecret: true,
      encryptedCredentials: true,
    },
  });
}

function extractMessageContent(
  message: JsonObject,
  messageType: string
): string | null {
  const text = asObject(message.text);
  const textBody = getString(text, "body");

  if (textBody) return textBody;

  const media = asObject(message[messageType]);

  if (media) {
    const caption = getString(media, "caption");
    const filename = getString(media, "filename");

    if (caption) return caption;
    if (filename) return filename;
  }

  const interactive = asObject(message.interactive);

  if (interactive) {
    const buttonReply = asObject(interactive.button_reply);
    const listReply = asObject(interactive.list_reply);

    return (
      getString(buttonReply, "title") ||
      getString(listReply, "title") ||
      "Balasan interaktif"
    );
  }

  const button = asObject(message.button);
  const buttonText = getString(button, "text");

  if (buttonText) return buttonText;

  const location = asObject(message.location);

  if (location) {
    return (
      getString(location, "name") ||
      getString(location, "address") ||
      "Lokasi dibagikan"
    );
  }

  if (messageType === "contacts") {
    return "Kontak dibagikan";
  }

  return `Pesan ${messageType}`;
}

async function processWebhookPayload(
  connection: NonNullable<
    Awaited<ReturnType<typeof getConnection>>
  >,
  payload: JsonObject
) {
  let savedMessages = 0;
  let updatedStatuses = 0;

  for (const entryValue of asArray(payload.entry)) {
    const entry = asObject(entryValue);

    for (const changeValue of asArray(entry?.changes)) {
      const change = asObject(changeValue);

      if (getString(change, "field") !== "messages") {
        continue;
      }

      const value = asObject(change?.value);

      if (!value) continue;

      const metadata = asObject(value.metadata);
      const phoneNumberId = getString(
        metadata,
        "phone_number_id"
      );

      // Pastikan event berasal dari nomor koneksi ini.
      if (
        connection.externalId &&
        phoneNumberId &&
        phoneNumberId !== connection.externalId
      ) {
        continue;
      }

      // Simpan pesan masuk.
      for (const messageValue of asArray(value.messages)) {
        const message = asObject(messageValue);

        if (!message) continue;

        const messageId = getString(message, "id");
        const senderId = getString(message, "from");
        const messageType =
          getString(message, "type") || "unknown";

        if (!messageId || !senderId) continue;

        const contact = asArray(value.contacts)
          .map(asObject)
          .find(
            (item) => getString(item, "wa_id") === senderId
          );

        const profile = asObject(contact?.profile);
        const profileName = getString(profile, "name");

        const customer = await prisma.customer.upsert({
          where: {
            merchantId_whatsappId: {
              merchantId: connection.merchantId,
              whatsappId: senderId,
            },
          },
          create: {
            merchantId: connection.merchantId,
            whatsappId: senderId,
            name: profileName || "Pelanggan WhatsApp",
          },
          update: profileName
            ? { name: profileName }
            : {},
        });

        await prisma.whatsAppMessage.upsert({
          where: {
            externalMessageId: messageId,
          },
          create: {
            platformConnectionId: connection.id,
            customerId: customer.id,
            externalMessageId: messageId,
            direction: "INBOUND",
            messageType,
            content: extractMessageContent(
              message,
              messageType
            ),
            status: "received",
            rawPayload: JSON.stringify(message),
          },
          update: {},
        });

        savedMessages++;
      }

      // Perbarui status pesan keluar.
      for (const statusValue of asArray(value.statuses)) {
        const statusEvent = asObject(statusValue);
        const messageId = getString(statusEvent, "id");
        const status = getString(statusEvent, "status");

        if (!messageId || !status) continue;

        const result = await prisma.whatsAppMessage.updateMany({
          where: {
            platformConnectionId: connection.id,
            externalMessageId: messageId,
          },
          data: {
            status,
          },
        });

        updatedStatuses += result.count;
      }
    }
  }

  return {
    savedMessages,
    updatedStatuses,
  };
}

// META WEBHOOK VERIFICATION
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const connection = await getConnection(
      context.params.connectionId
    );

    if (!connection || !connection.webhookSecret) {
      return new NextResponse("Connection not found", {
        status: 404,
      });
    }

    const mode = request.nextUrl.searchParams.get("hub.mode");
    const verifyToken =
      request.nextUrl.searchParams.get("hub.verify_token");
    const challenge =
      request.nextUrl.searchParams.get("hub.challenge");

    if (
      mode !== "subscribe" ||
      !verifyToken ||
      !challenge
    ) {
      return new NextResponse("Invalid verification request", {
        status: 400,
      });
    }

    const receivedHash = hashVerifyToken(verifyToken);

    if (
      !safeCompareHex(
        receivedHash,
        connection.webhookSecret
      )
    ) {
      return new NextResponse("Verification failed", {
        status: 403,
      });
    }

    await prisma.platformConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        status: "connected",
        connectedAt: new Date(),
      },
    });

    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("WhatsApp webhook verification error:", error);

    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}

// META WEBHOOK EVENTS
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const connection = await getConnection(
      context.params.connectionId
    );

    if (!connection || !connection.encryptedCredentials) {
      return NextResponse.json(
        { error: "Connection not found." },
        { status: 404 }
      );
    }

    const signature = request.headers.get(
      "x-hub-signature-256"
    );

    if (!signature || !signature.startsWith("sha256=")) {
      return NextResponse.json(
        { error: "Missing webhook signature." },
        { status: 401 }
      );
    }

    const rawBody = await request.text();

    const credentials = JSON.parse(
      decryptToken(connection.encryptedCredentials)
    ) as Credentials;

    const expectedSignature = createHmac(
      "sha256",
      credentials.appSecret
    )
      .update(rawBody)
      .digest("hex");

    const receivedSignature = signature.slice(7);

    if (
      !safeCompareHex(
        expectedSignature,
        receivedSignature
      )
    ) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    const payload = asObject(JSON.parse(rawBody));

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid webhook payload." },
        { status: 400 }
      );
    }

    const result = await processWebhookPayload(
      connection,
      payload
    );

    return NextResponse.json({
      success: true,
      received: true,
      ...result,
    });
  } catch (error) {
    console.error("WhatsApp webhook event error:", error);

    return NextResponse.json(
      { error: "Failed to process webhook." },
      { status: 500 }
    );
  }
}
