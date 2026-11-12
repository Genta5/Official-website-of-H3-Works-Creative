"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Package,
  CreditCard,
  User,
  CalendarDays,
  Filter,
} from "lucide-react";
import { storage } from "@/lib/storage";
import type { Order, OrderStatus } from "@/lib/types";

const demoOrders: Order[] = [
  {
    id: "ORD-00128",
    customerName: "Rizky Pratama",
    customerUsername: "rizkypratama",
    productName: "Canva Pro — 1 Bulan",
    quantity: 1,
    total: 25000,
    status: "Selesai",
    paymentStatus: "Dibayar",
    createdAt: "2026-11-09T12:42:00",
  },
  {
    id: "ORD-00127",
    customerName: "Nadia Putri",
    customerUsername: "nadiaputri",
    productName: "Spotify Premium — 1 Bulan",
    quantity: 1,
    total: 18000,
    status: "Menunggu",
    paymentStatus: "Belum Dibayar",
    createdAt: "2026-11-09T11:18:00",
  },
  {
    id: "ORD-00126",
    customerName: "Fajar Ramadhan",
    customerUsername: "fajarr",
    productName: "Netflix — 1 Bulan",
    quantity: 1,
    total: 35000,
    status: "Diproses",
    paymentStatus: "Dibayar",
    createdAt: "2026-11-09T10:05:00",
  },
  {
    id: "ORD-00125",
    customerName: "Dinda Ayu",
    customerUsername: "dindaayu",
    productName: "Canva Pro — 1 Tahun",
    quantity: 1,
    total: 120000,
    status: "Selesai",
    paymentStatus: "Dibayar",
    createdAt: "2026-11-08T21:30:00",
  },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusStyle: Record<OrderStatus, string> = {
  Menunggu: "bg-amber-50 text-amber-700",
  Diproses: "bg-blue-50 text-blue-700",
  Selesai: "bg-emerald-50 text-emerald-700",
  Dibatalkan: "bg-rose-50 text-rose-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [paymentFilter, setPaymentFilter] = useState("Semua");
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    const saved = storage.getOrders();
    if (saved.length === 0) {
      storage.saveOrders(demoOrders);
      setOrders(demoOrders);
    } else {
      setOrders(saved);
    }
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        `${order.id} ${order.customerName} ${order.customerUsername} ${order.productName}`
          .toLowerCase()
          .includes(keyword);
      const matchesStatus =
        statusFilter === "Semua" || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === "Semua" ||
        order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  function updateOrder(id: string, updates: Partial<Order>) {
    const updated = orders.map((order) =>
      order.id === id ? { ...order, ...updates } : order
    );
    setOrders(updated);
    storage.saveOrders(updated);

    if (selected?.id === id) {
      setSelected({ ...selected, ...updates });
    }
  }

  const totalRevenue = orders
    .filter((order) => order.paymentStatus === "Dibayar")
    .reduce((sum, order) => sum + order.total, 0);

  const waiting = orders.filter((order) => order.status === "Menunggu").length;
  const processing = orders.filter((order) => order.status === "Diproses").length;
  const completed = orders.filter((order) => order.status === "Selesai").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola dan pantau seluruh pesanan tokomu.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500">
          {orders.length} Total Pesanan
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary icon={ShoppingCart} label="Total Pesanan" value={orders.length.toString()} color="blue" />
        <Summary icon={Clock} label="Menunggu" value={waiting.toString()} color="amber" />
        <Summary icon={Package} label="Diproses" value={processing.toString()} color="indigo" />
        <Summary icon={CheckCircle2} label="Selesai" value={completed.toString()} color="emerald" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold text-slate-400">
          TOTAL PEMBAYARAN DITERIMA
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {formatRupiah(totalRevenue)}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Akumulasi pesanan dengan status pembayaran Dibayar.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-bold text-slate-900">Daftar Pesanan</h2>
          <p className="mt-1 text-xs text-slate-400">
            Cari pesanan dan kelola status transaksi.
          </p>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID, pelanggan, atau produk..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
              >
                <option value="Semua">Semua Pembayaran</option>
                <option value="Belum Dibayar">Belum Dibayar</option>
                <option value="Dibayar">Dibayar</option>
                <option value="Refund">Refund</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">ID Pesanan</th>
                <th className="px-4 py-4">Pelanggan</th>
                <th className="px-4 py-4">Produk</th>
                <th className="px-4 py-4">Tanggal</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Pembayaran</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-5 py-4">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="text-xs hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-bold text-blue-600">
                    #{order.id.replace(/^#/, "")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="font-semibold text-slate-700">{order.customerName}</div>
                    <div className="mt-1 text-slate-400">@{order.customerUsername || "-"}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {order.productName}
                    <div className="mt-1 text-slate-400">{order.quantity} unit</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-700">
                    {formatRupiah(order.total)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      order.paymentStatus === "Dibayar"
                        ? "bg-emerald-50 text-emerald-700"
                        : order.paymentStatus === "Refund"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelected(order)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
                      aria-label="Lihat detail pesanan"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-400">
              Tidak ada pesanan yang cocok dengan pencarian.
            </div>
          )}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-bold text-slate-900">Detail Pesanan</h2>
                <p className="mt-1 text-xs text-blue-600">#{selected.id.replace(/^#/, "")}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail icon={User} label="Pelanggan" value={selected.customerName} />
                <Detail icon={User} label="Username Telegram" value={`@${selected.customerUsername || "-"}`} />
                <Detail icon={Package} label="Produk" value={selected.productName} />
                <Detail icon={CalendarDays} label="Tanggal Pesanan" value={formatDate(selected.createdAt)} />
                <Detail icon={ShoppingCart} label="Jumlah" value={`${selected.quantity} unit`} />
                <Detail icon={CreditCard} label="Total" value={formatRupiah(selected.total)} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Status Pesanan</label>
                <select
                  value={selected.status}
                  onChange={(e) => updateOrder(selected.id, { status: e.target.value as OrderStatus })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                >
                  <option>Menunggu</option>
                  <option>Diproses</option>
                  <option>Selesai</option>
                  <option>Dibatalkan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Status Pembayaran</label>
                <select
                  value={selected.paymentStatus}
                  onChange={(e) => updateOrder(selected.id, { paymentStatus: e.target.value as Order["paymentStatus"] })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                >
                  <option>Belum Dibayar</option>
                  <option>Dibayar</option>
                  <option>Gagal</option>
                  <option>Kedaluwarsa</option>
                  <option>Refund</option>
                </select>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
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
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon size={19} />
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
        <Icon size={13} />
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-700">{value}</div>
    </div>
  );
}
