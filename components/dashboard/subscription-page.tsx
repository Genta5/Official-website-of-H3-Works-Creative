"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock3,
  CreditCard,
  History,
  Info,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";

type SubscriptionItem = {
  id: string;
  serviceKey: string;
  connectionLimit: number;
};

type Payment = {
  id: string;
  amount: number;
  currency: string;
  paidAt?: string | null;
  expiresAt?: string | null;
};

type Subscription = {
  id: string;
  planCode: string;
  durationMonths: number;
  status: string;
  amount: number;
  currency: string;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  items?: SubscriptionItem[];
  payments?: Payment[];
};

type HistoryItem = {
  id: string;
  planCode: string;
  durationMonths: number;
  status: string;
  amount: number;
  currency: string;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
};

type SubscriptionResponse = {
  subscription: Subscription | null;
  pendingSubscription: Subscription | null;
  entitlements: Record<
    string,
    { enabled: boolean; connectionLimit: number }
  >;
  history: HistoryItem[];
  hasActiveSubscription: boolean;
};

const serviceNames: Record<string, string> = {
  telegram: "Telegram Bot",
  TELEGRAM: "Telegram Bot",
  whatsapp: "WhatsApp Bot",
  WHATSAPP: "WhatsApp Bot",
  discord: "Discord Bot",
  DISCORD: "Discord Bot",
  website: "Website Store",
  WEBSITE: "Website Store",
  itemku: "Itemku Automation",
  ITEMKU: "Itemku Automation",
};

const formatPrice = (amount: number, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value?: string | null) => {
  if (!value) return "Belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const durationName = (months: number) =>
  `${months} ${months === 1 ? "Bulan" : "Bulan"}`;

const statusLabel: Record<string, string> = {
  ACTIVE: "Aktif",
  PENDING: "Menunggu pembayaran",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  FAILED: "Gagal",
  PAID: "Dibayar",
};

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  const pending = status === "PENDING";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : pending
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? (
        <Check size={12} />
      ) : pending ? (
        <Clock3 size={12} />
      ) : (
        <Info size={12} />
      )}
      {statusLabel[status] ?? status}
    </span>
  );
}

function Usage({
  label,
  limit,
}: {
  label: string;
  limit: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-xs font-semibold text-slate-600">
        {label}
      </span>
      <span className="text-xs font-extrabold text-slate-900">
        {limit} koneksi
      </span>
    </div>
  );
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscription = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await fetch("/api/subscription", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Gagal mengambil data langganan."
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  const active = data?.subscription ?? null;
  const pending = data?.pendingSubscription ?? null;
  const history = data?.history ?? [];
  const entitlements = data?.entitlements ?? {};

  const enabledServices = Object.entries(entitlements).filter(
    ([, value]) => value.enabled
  );

  const daysRemaining = active?.endsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(active.endsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Pantau paket, layanan, dan masa aktif langganan ORDERLY.
          </p>
          <h2 className="mt-1 font-[Plus_Jakarta_Sans] text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
            Langganan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Kelola seluruh layanan ORDERLY dari satu tempat.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadSubscription(true)}
          disabled={refreshing || loading}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
          Perbarui data
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">Gagal memuat langganan</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => void loadSubscription(true)}
            className="mt-3 font-bold underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <RefreshCw
            size={24}
            className="mx-auto animate-spin text-blue-600"
          />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Memuat data langganan...
          </p>
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CreditCard size={21} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Paket saat ini
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Informasi berdasarkan database langganan.
                  </p>
                </div>
              </div>

              {active ? (
                <StatusBadge status="ACTIVE" />
              ) : (
                <StatusBadge status="PENDING" />
              )}
            </div>

            <div className="p-5">
              {active ? (
                <>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {active.planCode}
                      </p>
                      <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
                        {durationName(active.durationMonths)}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {formatPrice(active.amount, active.currency)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 px-4 py-3 sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">
                        Sisa masa aktif
                      </p>
                      <p className="mt-1 text-2xl font-extrabold text-blue-700">
                        {daysRemaining} hari
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="text-xs text-slate-400">Mulai aktif</p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formatDate(active.startsAt)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="text-xs text-slate-400">
                        Berakhir pada
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formatDate(active.endsAt)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-5 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <ShieldCheck size={27} />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                    Belum ada paket aktif
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Pilih paket ORDERLY untuk mendapatkan akses layanan
                    sesuai kebutuhan bisnismu.
                  </p>
                  <a
                    href="/pricing"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    Lihat paket langganan
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              )}
            </div>
          </section>

          {pending && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <Clock3 size={20} className="mt-0.5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-amber-900">
                    Ada langganan menunggu pembayaran
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Paket {pending.planCode} untuk{" "}
                    {durationName(pending.durationMonths)} dengan total{" "}
                    {formatPrice(pending.amount, pending.currency)}.
                    Statusnya belum aktif.
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Layanan yang didapatkan
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Hak akses berdasarkan paket yang sedang aktif.
                </p>
              </div>
              <Zap size={18} className="text-blue-500" />
            </div>

            <div className="space-y-3 p-5">
              {enabledServices.length > 0 ? (
                enabledServices.map(([key, value]) => (
                  <Usage
                    key={key}
                    label={serviceNames[key] ?? key}
                    limit={value.connectionLimit}
                  />
                ))
              ) : (
                <div className="rounded-xl bg-slate-50 px-4 py-7 text-center">
                  <p className="text-sm font-semibold text-slate-500">
                    Belum ada layanan yang aktif.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Layanan akan muncul setelah langganan terverifikasi.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Riwayat langganan
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Maksimal 10 catatan langganan terbaru.
                </p>
              </div>
              <History size={18} className="text-slate-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Paket</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Nominal</th>
                    <th className="px-5 py-3">Durasi</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {history.length > 0 ? (
                    history.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {item.planCode}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700">
                          {formatPrice(item.amount, item.currency)}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {durationName(item.durationMonths)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-slate-400"
                      >
                        Belum ada riwayat langganan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Info
                size={17}
                className="mt-0.5 shrink-0 text-blue-600"
              />
              <p className="text-[11px] leading-5 text-blue-800">
                Data paket dan hak akses dibaca dari database. Pembayaran
                saat ini masih berupa simulasi. Aktivasi langganan
                produksi baru dilakukan setelah pembayaran diverifikasi
                oleh server melalui payment gateway.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
