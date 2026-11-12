import { NextRequest, NextResponse } from "next/server";
import {
  createPublicKey,
  verify,
} from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DiscordInteraction = {
  type: number;
  application_id?: string;
  guild_id?: string;
  channel_id?: string;
  data?: {
    name?: string;
  };
};

function verifyDiscordSignature(
  publicKeyHex: string,
  signatureHex: string,
  timestamp: string,
  rawBody: string
): boolean {
  try {
    if (
      !/^[a-f0-9]{64}$/i.test(publicKeyHex) ||
      !/^[a-f0-9]{128}$/i.test(signatureHex) ||
      !/^\d+$/.test(timestamp)
    ) {
      return false;
    }

    // Discord memberikan Ed25519 Public Key dalam format 32-byte hex.
    const derPrefix = Buffer.from(
      "302a300506032b6570032100",
      "hex"
    );

    const rawPublicKey = Buffer.from(publicKeyHex, "hex");

    const key = createPublicKey({
      key: Buffer.concat([derPrefix, rawPublicKey]),
      format: "der",
      type: "spki",
    });

    return verify(
      null,
      Buffer.from(timestamp + rawBody, "utf8"),
      key,
      Buffer.from(signatureHex, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentLengthHeader = request.headers.get("content-length");
    const contentLength = contentLengthHeader === null
      ? 0
      : Number(contentLengthHeader);

    if (
      !Number.isFinite(contentLength) ||
      contentLength < 0 ||
      !Number.isInteger(contentLength)
    ) {
      return NextResponse.json(
        { error: "Header ukuran request tidak valid." },
        { status: 400 }
      );
    }

    if (contentLength > 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload terlalu besar." },
        { status: 413 }
      );
    }

    const signature = request.headers.get(
      "x-signature-ed25519"
    );

    const timestamp = request.headers.get(
      "x-signature-timestamp"
    );

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: "Signature Discord tidak ditemukan." },
        { status: 401 }
      );
    }

    const timestampMs = Number(timestamp) * 1000;

    if (
      !Number.isFinite(timestampMs) ||
      Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000
    ) {
      return NextResponse.json(
        { error: "Timestamp interaksi tidak valid atau sudah kedaluwarsa." },
        { status: 401 }
      );
    }

    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload terlalu besar." },
        { status: 413 }
      );
    }

    let interaction: DiscordInteraction;

    try {
      interaction = JSON.parse(rawBody) as DiscordInteraction;
    } catch {
      return NextResponse.json(
        { error: "Payload Discord tidak valid." },
        { status: 400 }
      );
    }

    if (
      !interaction ||
      typeof interaction !== "object" ||
      Array.isArray(interaction)
    ) {
      return NextResponse.json(
        { error: "Payload Discord harus berupa objek." },
        { status: 400 }
      );
    }

    const applicationId = interaction.application_id;

    if (
      typeof applicationId !== "string" ||
      !/^\d{17,20}$/.test(applicationId)
    ) {
      return NextResponse.json(
        { error: "Application ID tidak ditemukan atau formatnya tidak valid." },
        { status: 400 }
      );
    }

    const connection =
      await prisma.platformConnection.findFirst({
        where: {
          platform: "DISCORD",
          externalId: applicationId,
        },
        select: {
          id: true,
          discordPublicKey: true,
        },
      });

    if (!connection?.discordPublicKey) {
      return NextResponse.json(
        { error: "Koneksi Discord tidak ditemukan." },
        { status: 404 }
      );
    }

    const signatureValid = verifyDiscordSignature(
      connection.discordPublicKey,
      signature,
      timestamp,
      rawBody
    );

    if (!signatureValid) {
      return NextResponse.json(
        { error: "Signature Discord tidak valid." },
        { status: 401 }
      );
    }

    // Pastikan interaction type berupa angka yang valid.
    if (
      typeof interaction.type !== "number" ||
      !Number.isInteger(interaction.type) ||
      interaction.type <= 0
    ) {
      return NextResponse.json(
        { error: "Tipe interaksi Discord tidak valid." },
        { status: 400 }
      );
    }

    // Discord mengirim PING saat memverifikasi endpoint.
    if (interaction.type === 1) {
      return NextResponse.json({ type: 1 });
    }

    // Saat ini ORDERLY menerima Slash Command.
    if (interaction.type !== 2) {
      return NextResponse.json({
        type: 4,
        data: {
          content: "Jenis interaksi ini belum didukung ORDERLY.",
          flags: 64,
        },
      });
    }

    if (
      !interaction.data ||
      typeof interaction.data !== "object" ||
      typeof interaction.data.name !== "string" ||
      interaction.data.name.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Data Slash Command Discord tidak valid." },
        { status: 400 }
      );
    }

    const commandName = interaction.data.name;

    if (commandName !== "orderly") {
      return NextResponse.json({
        type: 4,
        data: {
          content: "Perintah Discord belum dikenali ORDERLY.",
          flags: 64,
        },
      });
    }

    // ORDERLY saat ini hanya mendukung penggunaan di server Discord.
    const guildId = interaction.guild_id;

    if (!guildId) {
      return NextResponse.json({
        type: 4,
        data: {
          content: "ORDERLY hanya dapat digunakan di server Discord, bukan melalui Direct Message.",
          flags: 64,
        },
      });
    }

    if (
      typeof guildId !== "string" ||
      !/^\d{17,20}$/.test(guildId)
    ) {
      return NextResponse.json(
        { error: "Discord Guild ID tidak valid." },
        { status: 400 }
      );
    }

    // Simpan server Discord yang sudah lolos validasi Guild ID.
    const guildName = `Discord Server ${guildId}`;

    await prisma.discordGuild.upsert({
      where: {
        platformConnectionId_guildId: {
          platformConnectionId: connection.id,
          guildId,
        },
      },
      create: {
        platformConnectionId: connection.id,
        guildId,
        name: guildName,
        icon: null,
        status: "connected",
      },
      update: {
        name: guildName,
        icon: null,
        status: "connected",
      },
    });

    await prisma.platformConnection.update({
      where: { id: connection.id },
      data: {
        status: "connected",
        connectedAt: new Date(),
      },
    });

    return NextResponse.json({
      type: 4,
      data: {
        content:
          "ORDERLY aktif! Bot Discord berhasil terhubung dengan sistem ORDERLY.",
        flags: 64,
      },
    });
  } catch (error) {
    console.error("Discord interactions error:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses interaksi Discord." },
      { status: 500 }
    );
  }
}
