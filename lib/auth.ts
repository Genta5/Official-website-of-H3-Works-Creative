import "server-only";

import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "orderly_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [saltHex, keyHex] = storedHash.split(":");

    if (!saltHex || !keyHex) return false;

    const salt = Buffer.from(saltHex, "hex");
    const storedKey = Buffer.from(keyHex, "hex");

    if (storedKey.length !== 64) return false;

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return timingSafeEqual(storedKey, derivedKey);
  } catch {
    return false;
  }
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerMerchant(data: {
  name: string;
  email: string;
  password: string;
}) {
  const passwordHash = await hashPassword(data.password);

  return prisma.merchant.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function authenticateMerchant(
  email: string,
  password: string
) {
  const merchant = await prisma.merchant.findUnique({
    where: { email },
  });

  if (!merchant) return null;

  const valid = await verifyPassword(password, merchant.passwordHash);

  if (!valid || merchant.status !== "active") return null;

  return {
    id: merchant.id,
    name: merchant.name,
    email: merchant.email,
    status: merchant.status,
  };
}

export async function createSession(merchantId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.session.create({
    data: {
      merchantId,
      tokenHash,
      expiresAt,
    },
  });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentMerchant() {
  const token = cookies().get(COOKIE_NAME)?.value;

  if (!token) return null;

  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { merchant: true },
  });

  if (!session) return null;

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    });

    return null;
  }

  if (session.merchant.status !== "active") return null;

  return {
    id: session.merchant.id,
    name: session.merchant.name,
    email: session.merchant.email,
    status: session.merchant.status,
  };
}

export async function destroySession() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function createPasswordHash(password: string) {
  return hashPassword(password);
}

export async function checkPassword(
  password: string,
  storedHash: string
) {
  return verifyPassword(password, storedHash);
}
