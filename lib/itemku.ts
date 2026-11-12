import "server-only";

import { createHmac } from "crypto";

const ITEMKU_API_URL = "https://tokoku-gateway.itemku.com";

type ItemkuCredentials = {
  apiKey: string;
  secretKey: string;
};

export type ItemkuDeliveryInfo =
  | string[]
  | Array<Record<string, string>>;

export type ItemkuOrderActionResponse = {
  success: true;
  statusCode?: string;
  message?: string;
  data?: unknown;
};

function base64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

export function createItemkuToken(
  credentials: ItemkuCredentials,
  payload: Record<string, unknown>,
  nonce = Math.floor(Date.now() / 1000).toString()
) {
  const cleanPayload = JSON.parse(
    JSON.stringify(payload, (_key, value) =>
      typeof value === "string" ? value.trim() : value
    )
  );

  const header = {
    "X-Api-Key": credentials.apiKey.trim(),
    Nonce: nonce,
    alg: "HS256",
  };

  const unsignedToken =
    `${base64Url(JSON.stringify(header))}.` +
    `${base64Url(JSON.stringify(cleanPayload))}`;

  const signature = createHmac("sha256", credentials.secretKey)
    .update(unsignedToken)
    .digest("base64url");

  return {
    token: `${unsignedToken}.${signature}`,
    nonce,
    payload: cleanPayload,
  };
}

export async function itemkuRequest<T>(
  credentials: ItemkuCredentials,
  endpoint: string,
  payload: Record<string, unknown>
): Promise<T> {
  if (!endpoint.startsWith("/api/")) {
    throw new Error("Endpoint Itemku tidak valid.");
  }

  const auth = createItemkuToken(credentials, payload);
  const body = JSON.stringify(auth.payload);

  const response = await fetch(`${ITEMKU_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "X-Api-Key": credentials.apiKey.trim(),
      Authorization: `Bearer ${auth.token}`,
      Nonce: auth.nonce,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success !== true) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : "Permintaan ke Itemku gagal."
    );
  }

  return result as T;
}

export async function deliverItemkuOrder(
  credentials: ItemkuCredentials,
  orderId: number,
  quantity: number,
  deliveryInfo?: ItemkuDeliveryInfo
): Promise<ItemkuOrderActionResponse> {
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    throw new Error("Order ID Itemku tidak valid.");
  }

  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error("Quantity pesanan tidak valid.");
  }

  if (deliveryInfo !== undefined) {
    if (
      !Array.isArray(deliveryInfo) ||
      deliveryInfo.length !== quantity ||
      deliveryInfo.length === 0
    ) {
      throw new Error("Jumlah delivery_info tidak sesuai quantity.");
    }

    for (const item of deliveryInfo) {
      if (typeof item === "string") {
        if (!item.trim()) {
          throw new Error("Kode pengiriman tidak boleh kosong.");
        }

        continue;
      }

      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item) ||
        Object.keys(item).length === 0 ||
        Object.values(item).some(
          (value) => typeof value !== "string" || !value.trim()
        )
      ) {
        throw new Error("Format data akun tidak valid.");
      }
    }
  }

  const payload: Record<string, unknown> = {
    order_id: orderId,
    action: "DELIVER",
  };

  if (deliveryInfo !== undefined) {
    payload.delivery_info = deliveryInfo;
  }

  return itemkuRequest<ItemkuOrderActionResponse>(
    credentials,
    "/api/order/action",
    payload
  );
}
