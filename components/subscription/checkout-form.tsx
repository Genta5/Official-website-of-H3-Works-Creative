"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Layers3,
} from "lucide-react";

const services: Record<string, { name: string; monthlyPrice: number }> = {
  telegram: { name: "Telegram Bot", monthlyPrice: 49000 },
  whatsapp: { name: "WhatsApp Bot", monthlyPrice: 49000 },
  discord: { name: "Discord Bot", monthlyPrice: 49000 },
  website: { name: "Website Store", monthlyPrice: 79000 },
  itemku: { name: "Itemku Automation", monthlyPrice: 49000 },
  "all-in-one": { name: "All-in-One", monthlyPrice: 229000 },
};

const durations: Record<string, { name: string; months: number; discount: number }> = {
  "1-month": { name: "1 Bulan", months: 1, discount: 0 },
  "3-months": { name: "3 Bulan", months: 3, discount: 8 },
  "6-months": { name: "6 Bulan", months: 6, discount: 15 },
  "12-months": { name: "12 Bulan", months: 12, discount: 25 },
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CheckoutForm({
  plan,
  services: selectedServices,
}: {
  plan: string;
  services: string[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const duration = durations[plan] || durations["1-month"];

  const selected = useMemo(
    () => selectedServices.filter((id) => services[id]),
    [selectedServices]
  );

  const monthlyPrice = selected.reduce(
    (total, id) => total + services[id].monthlyPrice,
    0
  );

  const subtotal = monthlyPrice * duration.months;
  const discountAmount = Math.round(subtotal * duration.discount / 100);
  const total = subtotal - discountAmount;

  async function handleSubmit() {
    if (!selected.length || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          services: selected,
          plan,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal membuat pesanan.");
      }

      const checkout = {
        subscriptionId: result.subscription.id,
        paymentId: result.subscription.payments[0]?.id,
        services: selected,
        serviceNames: selected.map((id) => services[id].name),
        plan,
        months: duration.months,
        discountPercent: result.pricing.discountPercent,
        monthlyPrice: result.pricing.monthlyPrice,
        subtotal: result.pricing.subtotal,
        discountAmount: result.pricing.discountAmount,
        totalAmount: result.pricing.totalAmount,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "orderly_pending_subscription",
        JSON.stringify(checkout)
      );

      router.push("/payment");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat pesanan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080B14] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/pricing"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Kembali ke pricing
        </Link>

        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
            ORDERLY CHECKOUT
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Periksa pesananmu
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Pastikan layanan dan durasi langganan sudah sesuai sebelum
            melanjutkan.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_0.85fr]">
          <section className="rounded-2xl border border-white/10 bg-[#101625] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <Layers3 size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Layanan dipilih</h2>
                <p className="text-xs text-slate-400">
                  {selected.length} layanan
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selected.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={17} className="text-blue-400" />
                    <span className="text-sm font-medium">
                      {services[id].name}
                    </span>
                  </div>
                  <span className="text-sm text-slate-300">
                    {formatPrice(services[id].monthlyPrice)}/bln
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs text-slate-400">Durasi langganan</p>
              <p className="mt-1 text-lg font-semibold">{duration.name}</p>
              <p className="mt-1 text-sm text-blue-400">
                Diskon {duration.discount}%
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-500/20 bg-[#101625] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <CreditCard size={21} />
              </div>
              <h2 className="font-semibold">Ringkasan biaya</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Harga per bulan</span>
                <span>{formatPrice(monthlyPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Durasi</span>
                <span>{duration.months} bulan</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Diskon ({duration.discount}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            </div>

            <div className="my-5 border-t border-white/10" />

            <p className="text-xs text-slate-400">Total pembayaran</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {formatPrice(total)}
            </p>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selected.length}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lanjutkan
              <ArrowRight size={17} />
            </button>

            <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-400" />
              <p>
                Halaman pembayaran saat ini masih berupa simulasi. Belum ada
                transaksi atau penagihan uang sungguhan.
              </p>
            </div>
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Koneksi layanan akan diatur melalui proses integrasi setelah sistem
          pembayaran resmi tersedia.
        </p>
      </div>
    </main>
  );
}
