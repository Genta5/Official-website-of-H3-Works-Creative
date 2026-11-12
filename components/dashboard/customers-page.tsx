"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  ShoppingBag,
  Wallet,
  Eye,
  X,
  User,
  CalendarDays,
  Package,
} from "lucide-react";
import { storage } from "@/lib/storage";
import type { Customer, Order } from "@/lib/types";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const dateFormat = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    const savedOrders = storage.getOrders();
    const savedCustomers = storage.getCustomers();

    const customerMap = new Map<string, Customer>();

    savedOrders.forEach((order) => {
      const username = (order.customerUsername || "").toLowerCase();
      const key = username || order.customerName.toLowerCase();
      const existing = customerMap.get(key);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.paymentStatus === "Dibayar"
          ? order.total
          : 0;
      } else {
        const previous = savedCustomers.find(
          (customer) =>
            customer.username.toLowerCase() === username ||
            customer.name.toLowerCase() === order.customerName.toLowerCase()
        );

        customerMap.set(key, {
          id: previous?.id || `customer-${key}`,
          name: order.customerName,
          username: order.customerUsername || "",
          totalOrders: 1,
          totalSpent: order.paymentStatus === "Dibayar" ? order.total : 0,
          joinedAt: previous?.joinedAt || order.createdAt,
        });
      }
    });

    const result = Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );

    storage.saveCustomers(result);
    setCustomers(result);
    setOrders(savedOrders);
  }, []);

  const filtered = useMemo(
    () =>
      customers.filter((customer) =>
        `${customer.name} ${customer.username}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [customers, search]
  );

  const totalSpent = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.totalOrders,
    0
  );

  const customerOrders = selected
    ? orders.filter(
        (order) =>
          order.customerUsername.toLowerCase() ===
            selected.username.toLowerCase() ||
          (!selected.username &&
            order.customerName.toLowerCase() === selected.name.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kenali pelanggan dan pantau aktivitas transaksi mereka.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500">
          {customers.length} Pelanggan
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Summary
          icon={Users}
          label="Total Pelanggan"
          value={customers.length.toString()}
          color="blue"
        />
        <Summary
          icon={ShoppingBag}
          label="Total Pesanan"
          value={totalOrders.toString()}
          color="indigo"
        />
        <Summary
          icon={Wallet}
          label="Total Belanja Diterima"
          value={rupiah(totalSpent)}
          color="emerald"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-bold text-slate-900">Daftar Pelanggan</h2>
          <p className="mt-1 text-xs text-slate-400">
            Data pelanggan dirangkum dari pesanan yang tersimpan.
          </p>

          <div className="relative mt-4">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau username pelanggan..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Pelanggan</th>
                <th className="px-4 py-4">Bergabung</th>
                <th className="px-4 py-4">Total Pesanan</th>
                <th className="px-4 py-4">Total Belanja</th>
                <th className="px-5 py-4">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((customer) => (
                <tr key={customer.id} className="text-xs hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">
                          {customer.name}
                        </div>
                        <div className="mt-1 text-slate-400">
                          @{customer.username || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                    {dateFormat(customer.joinedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-700">
                    {customer.totalOrders} pesanan
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-700">
                    {rupiah(customer.totalSpent)}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelected(customer)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
                      aria-label="Lihat detail pelanggan"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-400">
              {customers.length === 0
                ? "Belum ada data pelanggan. Pelanggan akan muncul setelah ada pesanan."
                : "Pelanggan tidak ditemukan."}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-bold text-slate-900">
                  Detail Pelanggan
                </h2>
                <p className="mt-1 text-xs text-blue-600">
                  @{selected.username || "-"}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail
                  icon={User}
                  label="Nama"
                  value={selected.name}
                />
                <Detail
                  icon={CalendarDays}
                  label="Bergabung"
                  value={dateFormat(selected.joinedAt)}
                />
                <Detail
                  icon={ShoppingBag}
                  label="Total Pesanan"
                  value={`${selected.totalOrders} pesanan`}
                />
                <Detail
                  icon={Wallet}
                  label="Total Belanja"
                  value={rupiah(selected.totalSpent)}
                />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Riwayat Pesanan
                </h3>

                <div className="space-y-2">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold text-slate-700">
                          {order.productName}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">
                          #{order.id} · {dateFormat(order.createdAt)}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-500">
                          {order.status} · {order.paymentStatus}
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-xs font-bold text-slate-700">
                        {rupiah(order.total)}
                      </div>
                    </div>
                  ))}

                  {customerOrders.length === 0 && (
                    <p className="text-xs text-slate-400">
                      Belum ada riwayat pesanan.
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Tutup
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
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon size={19} />
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
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
