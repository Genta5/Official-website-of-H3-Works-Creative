"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  X,
  CalendarDays,
  User,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { storage } from "@/lib/storage";
import type { Order, Payment, PaymentStatus } from "@/lib/types";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const dateFormat = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusStyle: Record<PaymentStatus, string> = {
  Menunggu: "bg-amber-50 text-amber-700",
  Dibayar: "bg-emerald-50 text-emerald-700",
  Gagal: "bg-rose-50 text-rose-700",
  Kedaluwarsa: "bg-slate-100 text-slate-600",
  Refund: "bg-violet-50 text-violet-700",
};

const statuses: PaymentStatus[] = [
  "Menunggu",
  "Dibayar",
  "Gagal",
  "Kedaluwarsa",
  "Refund",
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState<Payment | null>(null);

  useEffect(() => {
    const savedOrders = storage.getOrders();
    const savedPayments = storage.getPayments();

    const synced: Payment[] = savedOrders.map((order) => {
      const previous = savedPayments.find(
        (payment) => payment.orderId === order.id
      );

      const status: PaymentStatus = previous
        ? previous.status
        : order.paymentStatus === "Dibayar"
          ? "Dibayar"
          : order.paymentStatus === "Refund"
            ? "Refund"
            : order.paymentStatus === "Gagal"
              ? "Gagal"
              : order.paymentStatus === "Kedaluwarsa"
                ? "Kedaluwarsa"
                : "Menunggu";

      return {
        id: previous?.id || `PAY-${order.id.replace("ORD-", "")}`,
        orderId: order.id,
        customerName: order.customerName,
        customerUsername: order.customerUsername,
        amount: order.total,
        method: previous?.method || "QRIS",
        provider: previous?.provider || "DABIS (Simulasi)",
        status,
        createdAt: previous?.createdAt || order.createdAt,
        paidAt: status === "Dibayar"
          ? previous?.paidAt || order.createdAt
          : undefined,
      };
    });

    const syncedOrders = savedOrders.map((order) => {
      const payment = synced.find((item) => item.orderId === order.id);
      if (!payment) return order;

      return {
        ...order,
        paymentStatus: payment.status === "Menunggu"
          ? "Belum Dibayar" as const
          : payment.status,
      };
    });

    storage.savePayments(synced);
    storage.saveOrders(syncedOrders);
    setPayments(synced);
    setOrders(syncedOrders);
  }, []);

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      const keyword =
        `${payment.id} ${payment.orderId} ${payment.customerName} ${payment.customerUsername}`
          .toLowerCase();
      return (
        keyword.includes(search.toLowerCase()) &&
        (filter === "Semua" || payment.status === filter)
      );
    });
  }, [payments, search, filter]);

  const paid = payments.filter((p) => p.status === "Dibayar");
  const pending = payments.filter((p) => p.status === "Menunggu");
  const failed = payments.filter(
    (p) => p.status === "Gagal" || p.status === "Kedaluwarsa"
  );
  const refunded = payments.filter((p) => p.status === "Refund");
  const totalReceived = paid.reduce((sum, p) => sum + p.amount, 0);
  const totalRefund = refunded.reduce((sum, p) => sum + p.amount, 0);

  function updatePayment(id: string, status: PaymentStatus) {
    const updated = payments.map((payment) =>
      payment.id === id
        ? {
            ...payment,
            status,
            paidAt:
              status === "Dibayar"
                ? payment.paidAt || new Date().toISOString()
                : undefined,
          }
        : payment
    );

    const changed = updated.find((payment) => payment.id === id);
    if (!changed) return;

    const updatedOrders = orders.map((order) =>
      order.id === changed.orderId
        ? {
            ...order,
            paymentStatus:
              status === "Menunggu"
                ? "Belum Dibayar" as const
                : status,
          }
        : order
    );

    setPayments(updated);
    setOrders(updatedOrders);
    storage.savePayments(updated);
    storage.saveOrders(updatedOrders);

    if (selected?.id === id) {
      setSelected(updated.find((p) => p.id === id) || null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau dan kelola seluruh transaksi pembayaran.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
          <RefreshCw size={14} />
          Mode Simulasi Lokal
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Summary icon={Receipt} label="Total Transaksi" value={payments.length.toString()} color="blue" />
        <Summary icon={Wallet} label="Total Diterima" value={rupiah(totalReceived)} color="emerald" />
        <Summary icon={Clock} label="Menunggu" value={pending.length.toString()} color="amber" />
        <Summary icon={XCircle} label="Gagal / Kedaluwarsa" value={failed.length.toString()} color="rose" />
        <Summary icon={RefreshCw} label={`Total Refund (${refunded.length} transaksi)`} value={rupiah(totalRefund)} color="blue" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold text-slate-400">
              PROVIDER PEMBAYARAN
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              DABIS <span className="text-sm font-medium text-slate-400">— Simulasi</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Metode pembayaran buyer: QRIS
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CreditCard size={23} />
          </div>
        </div>
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          Ini hanya simulasi dashboard. Belum ada QRIS aktif, permintaan
          pembayaran, atau konfirmasi transaksi dari DABIS.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-bold text-slate-900">Daftar Transaksi</h2>
          <p className="mt-1 text-xs text-slate-400">
            Transaksi dibuat berdasarkan pesanan yang tersimpan.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID transaksi, pesanan, atau pelanggan..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
            >
              <option value="Semua">Semua Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">ID Transaksi</th>
                <th className="px-4 py-4">Pelanggan</th>
                <th className="px-4 py-4">ID Pesanan</th>
                <th className="px-4 py-4">Metode</th>
                <th className="px-4 py-4">Tanggal</th>
                <th className="px-4 py-4">Nominal</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-5 py-4">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((payment) => (
                <tr key={payment.id} className="text-xs hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-bold text-blue-600">{payment.id}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">{payment.customerName}</p>
                    <p className="mt-1 text-slate-400">@{payment.customerUsername}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-600">{payment.orderId}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600">QRIS</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{dateFormat(payment.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-800">{rupiah(payment.amount)}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[payment.status]}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => setSelected(payment)} className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700">
                      <Eye size={14} /> Detail
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-bold text-slate-900">Detail Pembayaran</h2>
                <p className="mt-1 text-xs text-slate-400">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Total pembayaran</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{rupiah(selected.amount)}</p>
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusStyle[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <Info icon={User} label="Pelanggan" value={`${selected.customerName} (@${selected.customerUsername})`} />
              <Info icon={Receipt} label="ID Pesanan" value={selected.orderId} />
              <Info icon={CreditCard} label="Metode pembayaran" value="QRIS" />
              <Info icon={Wallet} label="Payment provider" value={selected.provider} />
              <Info icon={CalendarDays} label="Dibuat pada" value={dateFormat(selected.createdAt)} />
              {selected.paidAt && (
                <Info icon={CheckCircle2} label="Dibayar pada" value={dateFormat(selected.paidAt)} />
              )}

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">UBAH STATUS SIMULASI</label>
                <select
                  value={selected.status}
                  onChange={(e) => updatePayment(selected.id, e.target.value as PaymentStatus)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">
                  Perubahan status akan ikut memperbarui status pembayaran pada halaman Orders.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 p-5">
              <button onClick={() => setSelected(null)} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800">
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-500"><Icon size={16} /></div>
      <div>
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "blue" | "emerald" | "amber" | "rose";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${styles[color]}`}>
        <Icon size={19} />
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
