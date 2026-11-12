"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Link2,
  MessageCircle,
  Clock3,
  CreditCard,
} from "lucide-react";

type BotItem = {
  id: string;
  name: string;
  username: string;
  status: string;
  connectedAt: string | null;
  createdAt: string;
};

type Subscription = {
  id: string;
  durationMonths: number;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  amount: number | null;
  currency: string;
};

type Connection = {
  id: string;
  platform: string;
  name: string;
  externalId: string | null;
  username: string | null;
  status: string;
  connectedAt: string | null;
  createdAt: string;
  subscriptions: Subscription[];
  _count: {
    orders: number;
  };
};

export default function MyBotsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [bots, setBots] = useState<BotItem[]>([]);
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [retryingBotId, setRetryingBotId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [connectingWhatsApp, setConnectingWhatsApp] = useState(false);
  const [waName, setWaName] = useState("");
  const [waAppId, setWaAppId] = useState("");
  const [waAppSecret, setWaAppSecret] = useState("");
  const [waWabaId, setWaWabaId] = useState("");
  const [waPhoneNumberId, setWaPhoneNumberId] = useState("");
  const [waAccessToken, setWaAccessToken] = useState("");
  const [waVerification, setWaVerification] = useState<{
    connectionId: string;
    callbackUrl: string | null;
    verifyToken: string;
  } | null>(null);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [connectionResponse, botResponse] = await Promise.all([
        fetch("/api/platform-connections", { cache: "no-store" }),
        fetch("/api/bots", { cache: "no-store" }),
      ]);

      const connectionData = await connectionResponse.json();
      const botData = await botResponse.json();

      if (!connectionResponse.ok) {
        throw new Error(
          connectionData.error || "Gagal mengambil daftar koneksi."
        );
      }

      if (!botResponse.ok) {
        throw new Error(botData.error || "Gagal mengambil daftar bot.");
      }

      setConnections(
        Array.isArray(connectionData.connections)
          ? connectionData.connections
          : []
      );

      setBots(Array.isArray(botData.bots) ? botData.bots : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConnections();
  }, [loadConnections]);

  async function connectBot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setConnecting(true);
    setError("");
    setNotice("");

    try {
      const connectResponse = await fetch("/api/bots/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          token: token.trim(),
        }),
      });

      const connectData = await connectResponse.json();

      if (!connectResponse.ok || !connectData.bot?.id) {
        throw new Error(
          connectData.error || "Gagal memverifikasi bot."
        );
      }

      const botId = connectData.bot.id;

      setToken("");
      setName("");

      const webhookResponse = await fetch(
        `/api/bots/${encodeURIComponent(botId)}/webhook`,
        { method: "POST" }
      );

      const webhookData = await webhookResponse.json();

      await loadConnections();

      if (!webhookResponse.ok) {
        setNotice(
          "Bot berhasil diverifikasi, tetapi webhook belum terpasang. Silakan coba pasang ulang."
        );
        setError(
          webhookData.error || "Gagal memasang webhook."
        );
        return;
      }

      setNotice("Bot Telegram berhasil terhubung ke ORDERLY!");
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
      await loadConnections();
    } finally {
      setConnecting(false);
    }
  }

  async function connectWhatsApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setConnectingWhatsApp(true);
    setError("");
    setNotice("");
    setWaVerification(null);

    try {
      const response = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: waName.trim(),
          appId: waAppId.trim(),
          appSecret: waAppSecret.trim(),
          wabaId: waWabaId.trim(),
          phoneNumberId: waPhoneNumberId.trim(),
          accessToken: waAccessToken.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat koneksi WhatsApp.");
      }

      if (!data.verifyToken) {
        throw new Error(
          "Koneksi tersimpan, tetapi Verify Token tidak diterima. Periksa respons backend."
        );
      }

      setWaVerification({
        connectionId: data.connection.id,
        callbackUrl: data.callbackUrl || null,
        verifyToken: data.verifyToken,
      });

      setWaName("");
      setWaAppId("");
      setWaAppSecret("");
      setWaWabaId("");
      setWaPhoneNumberId("");
      setWaAccessToken("");

      setNotice(
        "Data WhatsApp berhasil diverifikasi dan disimpan. Lanjutkan konfigurasi webhook di Meta."
      );

      await loadConnections();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghubungkan WhatsApp."
      );
    } finally {
      setConnectingWhatsApp(false);
    }
  }

  async function syncWhatsApp() {
    if (!waVerification?.connectionId) {
      setError("ID koneksi WhatsApp tidak ditemukan.");
      return;
    }

    setConnectingWhatsApp(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/whatsapp/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectionId: waVerification.connectionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyinkronkan WABA.");
      }

      setNotice(
        data.message || "WABA berhasil disinkronkan dengan ORDERLY."
      );
      await loadConnections();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat sinkronisasi WABA."
      );
    } finally {
      setConnectingWhatsApp(false);
    }
  }

  async function retryWebhook(botId: string) {
    setRetryingBotId(botId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/bots/${encodeURIComponent(botId)}/webhook`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Gagal memasang ulang webhook."
        );
      }

      await loadConnections();
      setNotice("Webhook berhasil dipasang. Bot sekarang terhubung.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memasang ulang webhook."
      );
      await loadConnections();
    } finally {
      setRetryingBotId(null);
    }
  }

  const [showDiscordForm, setShowDiscordForm] = useState(false);
  const [connectingDiscord, setConnectingDiscord] = useState(false);
  const [syncingDiscord, setSyncingDiscord] = useState(false);
  const [discordName, setDiscordName] = useState("");
  const [discordApplicationId, setDiscordApplicationId] = useState("");
  const [discordPublicKey, setDiscordPublicKey] = useState("");
  const [discordBotToken, setDiscordBotToken] = useState("");
  const [discordSetup, setDiscordSetup] = useState<{
    connectionId: string;
    inviteUrl: string;
  } | null>(null);

  const connectedCount = connections.filter(
    (item) => item.status === "connected"
  ).length;

  const telegramCount = connections.filter(
    (item) => item.platform === "TELEGRAM"
  ).length;

  const whatsappCount = connections.filter(
    (item) => item.platform === "WHATSAPP"
  ).length;

  function getStatusLabel(status: string) {
    if (status === "connected") return "Terhubung";
    if (status === "pending") return "Menunggu konfigurasi";
    if (status === "disconnected") return "Terputus";
    if (status === "error") return "Bermasalah";
    return status;
  }

  async function connectDiscord(event: import("react").FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConnectingDiscord(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/discord/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: discordName.trim(),
          applicationId: discordApplicationId.trim(),
          publicKey: discordPublicKey.trim(),
          botToken: discordBotToken.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal menghubungkan bot Discord.");
      }

      if (!data.connection?.id || !data.inviteUrl) {
        throw new Error("Respons koneksi Discord tidak lengkap.");
      }

      setDiscordSetup({
        connectionId: data.connection.id,
        inviteUrl: data.inviteUrl,
      });
      setDiscordName("");
      setDiscordApplicationId("");
      setDiscordPublicKey("");
      setDiscordBotToken("");
      setNotice("Bot Discord berhasil disimpan.");
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghubungkan Discord.");
    } finally {
      setConnectingDiscord(false);
    }
  }

  async function syncDiscord() {
    if (!discordSetup) return;
    setSyncingDiscord(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/discord/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: discordSetup.connectionId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mendaftarkan slash command.");
      }

      setNotice(data.message || "Slash command Discord berhasil didaftarkan.");
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal sinkronisasi Discord.");
    } finally {
      setSyncingDiscord(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Koneksi Platform
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Kelola koneksi Telegram, WhatsApp, dan Discord melalui ORDERLY.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setNotice("");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Hubungkan Telegram
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            Total koneksi
          </p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {connections.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            Koneksi aktif
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">
            {connectedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            Menunggu konfigurasi
          </p>
          <p className="mt-2 text-2xl font-extrabold text-amber-600">
            {connections.length - connectedCount}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Bot size={23} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Telegram</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">
              {telegramCount} koneksi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <MessageCircle size={23} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">WhatsApp</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">
              {whatsappCount} koneksi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Bot size={23} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Discord</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">
              {connections.filter((item) => item.platform === "DISCORD").length} koneksi
            </p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-900">
              Hubungkan bot Telegram
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Masukkan informasi bot yang dibuat melalui BotFather.
            </p>
          </div>

          <form onSubmit={connectBot} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Nama koneksi
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="Contoh: Bot Toko Genta"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Telegram Bot Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
                autoComplete="off"
                maxLength={512}
                placeholder="Masukkan token dari BotFather"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                Token diverifikasi di backend dan disimpan dalam bentuk
                terenkripsi. Jangan bagikan token kepada siapa pun.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={connecting || !name.trim() || !token.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <Bot size={15} />
                    Hubungkan sekarang
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={connecting}
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setToken("");
                  setError("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
            </div>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-800">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <span>
              ORDERLY tidak akan menampilkan kembali token bot setelah
              proses penyimpanan.
            </span>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Semua koneksi
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Data koneksi platform dari database ORDERLY.
            </p>
          </div>

          <button
            onClick={() => void loadConnections()}
            disabled={loading}
            aria-label="Muat ulang koneksi"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-xs text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            Memuat koneksi...
          </div>
        ) : connections.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Link2 size={25} />
            </div>
            <h4 className="mt-4 text-sm font-bold text-slate-800">
              Belum ada koneksi platform
            </h4>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
              Hubungkan platform pertamamu untuk mulai menggunakan sistem
              otomatis ORDERLY.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {connections.map((connection) => {
              const isTelegram = connection.platform === "TELEGRAM";
              const isWhatsApp = connection.platform === "WHATSAPP";
              const isDiscord = connection.platform === "DISCORD";
              const bot = isTelegram
                ? bots.find((item) => item.username === connection.username)
                : undefined;

              const connected = connection.status === "connected";
              const retrying =
                bot !== undefined && retryingBotId === bot.id;

              const subscription = connection.subscriptions?.[0];

              return (
                <div
                  key={connection.id}
                  className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isTelegram
                          ? "bg-blue-50 text-blue-600"
                          : isWhatsApp
                            ? "bg-green-50 text-green-600"
                            : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {isTelegram || isDiscord ? (
                        <Bot size={21} />
                      ) : (
                        <MessageCircle size={21} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate text-sm font-bold text-slate-900">
                          {connection.name}
                        </h4>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                          {isTelegram ? "TELEGRAM" : isWhatsApp ? "WHATSAPP" : "DISCORD"}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {connection.username
                          ? `@${connection.username}`
                          : connection.externalId || "Identitas belum tersedia"}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Ditambahkan:{" "}
                        {new Date(connection.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                        {" · "}
                        {connection._count.orders} pesanan
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold ${
                        connected
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          connected ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {getStatusLabel(connection.status)}
                    </span>

                    {subscription ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700">
                        <CreditCard size={12} />
                        {subscription.durationMonths} bulan ·{" "}
                        {subscription.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500">
                        <Clock3 size={12} />
                        Belum berlangganan
                      </span>
                    )}

                    {isTelegram && bot && !connected && (
                      <button
                        onClick={() => void retryWebhook(bot.id)}
                        disabled={retrying || retryingBotId !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {retrying ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Link2 size={13} />
                        )}
                        {retrying ? "Memasang..." : "Pasang ulang webhook"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-green-100 bg-green-50/50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 text-green-600" size={22} />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Integrasi WhatsApp Business
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Hubungkan WhatsApp Business Platform resmi dari Meta
                menggunakan kredensial milik bisnismu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowWhatsAppForm(!showWhatsAppForm);
              setError("");
              setNotice("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-xs font-bold text-white hover:bg-green-700"
          >
            <Plus size={15} />
            {showWhatsAppForm ? "Tutup formulir" : "Hubungkan WhatsApp"}
          </button>
        </div>

        {showWhatsAppForm && (
          <form onSubmit={connectWhatsApp} className="mt-5 space-y-4 border-t border-green-100 pt-5">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Nama koneksi
              </label>
              <input
                value={waName}
                onChange={(event) => setWaName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="Contoh: WhatsApp Toko Genta"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  Meta App ID
                </label>
                <input
                  value={waAppId}
                  onChange={(event) => setWaAppId(event.target.value)}
                  required
                  maxLength={100}
                  autoComplete="off"
                  placeholder="Meta App ID"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  Meta App Secret
                </label>
                <input
                  type="password"
                  value={waAppSecret}
                  onChange={(event) => setWaAppSecret(event.target.value)}
                  required
                  maxLength={256}
                  autoComplete="new-password"
                  placeholder="Meta App Secret"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <input
                  value={waWabaId}
                  onChange={(event) => setWaWabaId(event.target.value)}
                  required
                  maxLength={100}
                  placeholder="WABA ID"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  Phone Number ID
                </label>
                <input
                  value={waPhoneNumberId}
                  onChange={(event) => setWaPhoneNumberId(event.target.value)}
                  required
                  maxLength={100}
                  placeholder="Phone Number ID dari Meta"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">
                System User Access Token
              </label>
              <input
                type="password"
                value={waAccessToken}
                onChange={(event) => setWaAccessToken(event.target.value)}
                required
                maxLength={4096}
                autoComplete="new-password"
                placeholder="Masukkan Access Token dari Meta"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={connectingWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {connectingWhatsApp ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <MessageCircle size={15} />
                    Verifikasi dan hubungkan
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={connectingWhatsApp}
                onClick={() => setShowWhatsAppForm(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600"
              >
                Batal
              </button>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-white p-3 text-[11px] leading-relaxed text-slate-600">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-600" />
              <span>
                Kredensial dikirim langsung ke backend ORDERLY dan disimpan
                terenkripsi. Jangan bagikan Access Token atau App Secret.
              </span>
            </div>
          </form>
        )}

        {waVerification && (
          <div className="mt-5 space-y-3 rounded-xl border border-green-200 bg-white p-4">
            <h4 className="text-xs font-bold text-green-800">
              Data verifikasi webhook Meta
            </h4>
            {waVerification.callbackUrl ? (
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Callback URL
                </label>
                <div className="break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  {waVerification.callbackUrl}
                </div>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(waVerification.callbackUrl || "")}
                  className="mt-2 text-xs font-bold text-blue-600"
                >
                  Salin Callback URL
                </button>
              </div>
            ) : (
              <p className="text-xs text-amber-700">
                APP_URL belum dikonfigurasi sebagai alamat HTTPS. Callback URL belum tersedia.
              </p>
            )}

            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-600">
                Verify Token
              </label>
              <div className="break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                {waVerification.verifyToken}
              </div>
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(waVerification.verifyToken)}
                className="mt-2 text-xs font-bold text-blue-600"
              >
                Salin Verify Token
              </button>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-500">
              Simpan Verify Token ini sekarang. Token hanya ditampilkan pada proses koneksi ini.
              Setelah itu, konfigurasi callback dan webhook di dashboard Meta.
            </p>

            <button
              type="button"
              onClick={() => void syncWhatsApp()}
              disabled={connectingWhatsApp || !waVerification.callbackUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {connectingWhatsApp ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Menyinkronkan...
                </>
              ) : (
                <>
                  <RefreshCw size={15} />
                  Saya sudah verifikasi webhook — Sinkronkan WABA
                </>
              )}
            </button>

            <p className="text-[11px] leading-relaxed text-slate-500">
              Klik tombol ini setelah callback berhasil diverifikasi di dashboard Meta.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Bot className="mt-0.5 text-indigo-600" size={22} />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Integrasi Discord</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Hubungkan bot Discord milikmu menggunakan kredensial dari Discord Developer Portal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowDiscordForm(!showDiscordForm);
              setError("");
              setNotice("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"
          >
            <Plus size={15} />
            {showDiscordForm ? "Tutup formulir" : "Hubungkan Discord"}
          </button>
        </div>

        {showDiscordForm && (
          <form onSubmit={connectDiscord} className="mt-5 space-y-4 border-t border-indigo-100 pt-5">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">Nama koneksi</label>
              <input
                value={discordName}
                onChange={(event) => setDiscordName(event.target.value)}
                required minLength={2} maxLength={80}
                placeholder="Contoh: Bot Discord Toko"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">Application ID</label>
                <input
                  value={discordApplicationId}
                  onChange={(event) => setDiscordApplicationId(event.target.value)}
                  required maxLength={20} inputMode="numeric"
                  placeholder="Discord Application ID"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">Public Key</label>
                <input
                  value={discordPublicKey}
                  onChange={(event) => setDiscordPublicKey(event.target.value)}
                  required maxLength={64} minLength={64} autoComplete="off"
                  placeholder="64 karakter hexadecimal"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">Bot Token</label>
              <input
                type="password"
                value={discordBotToken}
                onChange={(event) => setDiscordBotToken(event.target.value)}
                required minLength={30} maxLength={512} autoComplete="new-password"
                placeholder="Masukkan Bot Token"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
              <p className="mt-2 text-[11px] text-slate-400">
                Token diverifikasi di backend dan disimpan terenkripsi. Jangan bagikan token ini.
              </p>
            </div>

            <button
              type="submit"
              disabled={connectingDiscord || !discordName.trim() || !discordApplicationId.trim() || !discordPublicKey.trim() || !discordBotToken.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {connectingDiscord ? <Loader2 size={15} className="animate-spin" /> : <Bot size={15} />}
              {connectingDiscord ? "Memverifikasi..." : "Verifikasi dan simpan bot"}
            </button>
          </form>
        )}

        {discordSetup && (
          <div className="mt-5 space-y-3 rounded-xl border border-indigo-200 bg-white p-4">
            <h4 className="text-xs font-bold text-indigo-800">Langkah berikutnya</h4>
            <a
              href={discordSetup.inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 break-all text-xs font-bold text-indigo-600"
            >
              Undang bot ke server Discord <ExternalLink size={13} />
            </a>
            <button
              type="button"
              onClick={() => void syncDiscord()}
              disabled={syncingDiscord}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {syncingDiscord ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              {syncingDiscord ? "Mendaftarkan command..." : "Daftarkan slash command"}
            </button>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Di Discord Developer Portal, isi Interactions Endpoint URL dengan alamat HTTPS publik ORDERLY yang diakhiri <code>/api/discord/interactions</code>.
            </p>
          </div>
        )}
      </section>

      <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-relaxed text-slate-500">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-blue-600" />
        <span>
          Setiap koneksi platform akan memiliki subscription tersendiri.
          Setiap koneksi Telegram, WhatsApp, dan Discord memiliki masa berlangganan tersendiri.
        </span>
      </div>

      <a
        href="https://t.me/BotFather"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
      >
        Buka Telegram BotFather <ExternalLink size={13} />
      </a>
    </div>
  );
}
