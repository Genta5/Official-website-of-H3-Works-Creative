"use client";

import { useState } from "react";
import ProductsPage from "@/components/dashboard/products-page";
import InventoryPage from "@/components/dashboard/inventory-page";
import OrdersPage from "@/components/dashboard/orders-page";
import CustomersPage from "@/components/dashboard/customers-page";
import PaymentsPage from "@/components/dashboard/payments-page";
import StoreSettingsPage from "@/components/dashboard/store-settings-page";
import SubscriptionPage from "@/components/dashboard/subscription-page";
import MyBotsPage from "@/components/dashboard/my-bots-page";
import WhatsAppInboxPage from "@/components/dashboard/whatsapp-inbox-page";
import StoreBuilderPage from "@/components/dashboard/store-builder-page";
import ItemkuAutomationPage from "@/components/dashboard/itemku-automation-page";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bot,
  Boxes,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Globe,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

type Section =
  | "Dashboard"
  | "Koneksi Platform"
  | "Products"
  | "Itemku Automation"
  | "Inventory"
  | "Website Store"
  | "Orders"
  | "Customers"
  | "WhatsApp Inbox"
  | "Payments"
  | "Store Settings"
  | "Subscription";

const navGroups = [
  {
    label: "WORKSPACE",
    items: [
      { name: "Dashboard" as Section, icon: LayoutDashboard },
      { name: "Koneksi Platform" as Section, icon: Bot },
      { name: "Products" as Section, icon: Package },
      { name: "Itemku Automation" as Section, icon: Zap },
      { name: "Inventory" as Section, icon: Boxes },
      { name: "Website Store" as Section, icon: Globe },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { name: "Orders" as Section, icon: ShoppingCart },
      { name: "Customers" as Section, icon: Users },
      { name: "WhatsApp Inbox" as Section, icon: MessageCircle },
      { name: "Payments" as Section, icon: CreditCard },
    ],
  },
  {
    label: "PREFERENCES",
    items: [
      { name: "Store Settings" as Section, icon: Settings },
      { name: "Subscription" as Section, icon: Zap },
    ],
  },
];

const orders = [
  {
    id: "#ORD-00128",
    customer: "Rizky Pratama",
    product: "Canva Pro — 1 Bulan",
    date: "09 Nov 2026, 12:42",
    amount: "Rp25.000",
    status: "Selesai",
  },
  {
    id: "#ORD-00127",
    customer: "Nadia Putri",
    product: "Spotify Premium — 1 Bulan",
    date: "09 Nov 2026, 11:18",
    amount: "Rp18.000",
    status: "Menunggu",
  },
  {
    id: "#ORD-00126",
    customer: "Fajar Ramadhan",
    product: "Netflix — 1 Bulan",
    date: "09 Nov 2026, 10:05",
    amount: "Rp35.000",
    status: "Diproses",
  },
  {
    id: "#ORD-00125",
    customer: "Dinda Ayu",
    product: "Canva Pro — 1 Tahun",
    date: "08 Nov 2026, 21:30",
    amount: "Rp120.000",
    status: "Selesai",
  },
];

const bars = [35, 48, 40, 64, 52, 78, 58, 88, 69, 94, 73, 82];

export default function Home() {
  const [active, setActive] = useState<Section>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("7 hari terakhir");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const pageTitle = active === "Dashboard" ? "Dashboard" : active;

  const filteredOrders = orders.filter((o) =>
    `${o.id} ${o.customer} ${o.product}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function choosePage(name: Section) {
    setActive(name);
    setSidebarOpen(false);
    setNotice("");
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {sidebarOpen && (
        <button
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Activity size={21} />
            </div>
            <div>
              <div className="font-[Plus_Jakarta_Sans] text-[19px] font-extrabold tracking-tight text-slate-900">
                ORDERLY
              </div>
              <div className="text-[10px] font-semibold tracking-[.18em] text-slate-400">
                MERCHANT PANEL
              </div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-4 mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            <span className="text-xs font-semibold text-slate-700">
              Workspace aktif
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">
              Toko Genta
            </span>
            <ChevronDown size={15} className="text-slate-400" />
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            @tokogenta_bot
          </p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[.16em] text-slate-400">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const selected = active === item.name;

                  return (
                    <button
                      key={item.name}
                      onClick={() => choosePage(item.name)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                        selected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={selected ? 2.3 : 1.9}
                      />
                      <span>{item.name}</span>

                      {item.name === "Orders" && (
                        <span
                          className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] ${
                            selected
                              ? "bg-white/20 text-white"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          8
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Langganan ORDERLY
              </span>
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                FREE
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[35%] rounded-full bg-blue-600" />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              Contoh: 1 bot terhubung
            </p>
          </div>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50">
            <CircleHelp size={16} />
            Pusat bantuan
          </button>

          <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
              GJ
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">
                Genta J. Dilaga
              </p>
              <p className="text-[10px] text-slate-400">
                Pemilik toko
              </p>
            </div>
            <ChevronDown size={15} className="text-slate-400" />
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div>
              <div className="text-[11px] font-medium text-slate-400">
                Workspace /{" "}
                <span className="text-slate-600">{pageTitle}</span>
              </div>
              <h1 className="mt-0.5 font-[Plus_Jakarta_Sans] text-lg font-bold text-slate-900">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search size={15} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pesanan..."
                className="w-36 bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => setNotice("Belum ada notifikasi baru.")}
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                GJ
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Genta
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          {active === "Itemku Automation" ? (
            <ItemkuAutomationPage />
          ) : active === "Website Store" ? (
            <StoreBuilderPage />
          ) : active === "Koneksi Platform" ? (
            <MyBotsPage />
          ) : active === "Products" ? (
            <ProductsPage />
          ) : active === "Inventory" ? (
            <InventoryPage />
          ) : active === "Orders" ? (
            <OrdersPage />
          ) : active === "Customers" ? (
            <CustomersPage />
          ) : active === "WhatsApp Inbox" ? (
            <WhatsAppInboxPage />
          ) : active === "Payments" ? (
            <PaymentsPage />
          ) : active === "Store Settings" ? (
            <StoreSettingsPage />
          ) : active === "Subscription" ? (
            <SubscriptionPage />
          ) : active === "Dashboard" ? (
            <>
              <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm text-slate-500">
                    Senin, 9 November 2026
                  </p>
                  <h2 className="mt-1 font-[Plus_Jakarta_Sans] text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                    Selamat siang, Genta! <span>👋</span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Pantau performa dan aktivitas tokomu hari ini.
                  </p>
                </div>

                <button
                  onClick={() => choosePage("Products")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Tambah produk
                </button>
              </div>

              {notice && (
                <div className="mb-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                  <span>{notice}</span>
                  <button onClick={() => setNotice("")}>
                    <X size={15} />
                  </button>
                </div>
              )}

              <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total penjualan"
                  value="Rp2.450.000"
                  change="+12,5%"
                  icon={<Wallet size={18} />}
                  positive
                />
                <StatCard
                  title="Total pesanan"
                  value="128"
                  change="+8,2%"
                  icon={<ShoppingBag size={18} />}
                  positive
                />
                <StatCard
                  title="Bot aktif"
                  value="1 / 3"
                  change="Terhubung"
                  icon={<Bot size={18} />}
                />
                <StatCard
                  title="Produk aktif"
                  value="24"
                  change="3 stok menipis"
                  icon={<Package size={18} />}
                  warning
                />
              </div>

              <div className="mb-6 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Ringkasan penjualan
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Performa tokomu berdasarkan periode
                      </p>
                    </div>

                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 outline-none"
                    >
                      <option>7 hari terakhir</option>
                      <option>30 hari terakhir</option>
                      <option>12 bulan terakhir</option>
                    </select>
                  </div>

                  <div className="mb-2 flex items-end gap-3">
                    <span className="font-[Plus_Jakarta_Sans] text-[27px] font-extrabold tracking-tight text-slate-900">
                      Rp2.450.000
                    </span>
                    <span className="mb-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-1 text-[10px] font-bold text-emerald-600">
                      <ArrowUpRight size={12} />
                      12,5%
                    </span>
                  </div>

                  <div className="relative mt-5 h-[190px]">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {["2,5 jt", "1,8 jt", "1,2 jt", "600 rb", "0"].map(
                        (v) => (
                          <div
                            key={v}
                            className="flex items-center gap-3"
                          >
                            <span className="w-10 text-[9px] text-slate-400">
                              {v}
                            </span>
                            <div className="h-px flex-1 border-t border-dashed border-slate-100" />
                          </div>
                        )
                      )}
                    </div>

                    <div className="absolute inset-y-0 left-[53px] right-1 flex items-end justify-between gap-2">
                      {bars.map((h, i) => (
                        <div
                          key={i}
                          className="group relative flex h-full flex-1 items-end"
                        >
                          <div
                            style={{ height: `${h}%` }}
                            className={`w-full rounded-t-md transition-all ${
                              i === 9
                                ? "bg-blue-600"
                                : "bg-blue-100 group-hover:bg-blue-300"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ml-[53px] mt-3 flex justify-between text-[9px] text-slate-400">
                    <span>3 Nov</span>
                    <span>5 Nov</span>
                    <span>7 Nov</span>
                    <span>9 Nov</span>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Status pesanan
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Distribusi pesanan tokomu
                      </p>
                    </div>
                    <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50">
                      <ChevronRight size={17} />
                    </button>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <div
                      className="relative flex h-40 w-40 items-center justify-center rounded-full"
                      style={{
                        background:
                          "conic-gradient(#2563eb 0 66%, #f59e0b 66% 84%, #10b981 84% 100%)",
                      }}
                    >
                      <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white">
                        <span className="font-[Plus_Jakarta_Sans] text-3xl font-extrabold text-slate-900">
                          128
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Total pesanan
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      {
                        label: "Selesai",
                        count: "84 pesanan",
                        color: "bg-blue-600",
                        pct: "66%",
                      },
                      {
                        label: "Diproses",
                        count: "23 pesanan",
                        color: "bg-amber-400",
                        pct: "18%",
                      },
                      {
                        label: "Menunggu",
                        count: "21 pesanan",
                        color: "bg-emerald-500",
                        pct: "16%",
                      },
                    ].map((x) => (
                      <div
                        key={x.label}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${x.color}`}
                          />
                          <span className="font-semibold text-slate-600">
                            {x.label}
                          </span>
                          <span className="text-slate-400">
                            {x.count}
                          </span>
                        </div>
                        <span className="font-bold text-slate-700">
                          {x.pct}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Pesanan terbaru
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Aktivitas transaksi yang baru masuk
                    </p>
                  </div>

                  <button
                    onClick={() => choosePage("Orders")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Lihat semua <ChevronRight size={14} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-6 py-3">ID Pesanan</th>
                        <th className="px-4 py-3">Pelanggan</th>
                        <th className="px-4 py-3">Produk</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((o) => (
                        <tr
                          key={o.id}
                          className="text-xs transition hover:bg-slate-50/70"
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-bold text-blue-600">
                            {o.id}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-700">
                            {o.customer}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                            {o.product}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-400">
                            {o.date}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-700">
                            {o.amount}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <Status status={o.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredOrders.length === 0 && (
                  <p className="p-8 text-center text-xs text-slate-400">
                    Pesanan tidak ditemukan.
                  </p>
                )}
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Bot size={16} className="text-blue-600" />
                      Koneksi Telegram
                    </div>
                    <p className="text-xs text-slate-500">
                      Bot tokomu sudah terhubung dan siap menerima pesanan.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      @tokogenta_bot aktif
                    </div>
                  </div>

                  <button
                    onClick={() => choosePage("Koneksi Platform")}
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Kelola bot
                  </button>
                </section>

                <section className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm sm:p-6">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Zap size={16} className="text-blue-600" />
                      Kembangkan tokomu
                    </div>
                    <p className="text-xs text-slate-500">
                      Upgrade paket untuk mengelola lebih banyak bot dan pesanan.
                    </p>
                    <button
                      onClick={() => choosePage("Subscription")}
                      className="mt-3 text-[10px] font-bold text-blue-600"
                    >
                      Lihat paket ORDERLY →
                    </button>
                  </div>

                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 sm:flex">
                    <ChartNoAxesCombined size={23} />
                  </div>
                </section>
              </div>

              <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[10px] text-slate-400 sm:flex-row">
                <span>© 2026 ORDERLY. All rights reserved.</span>
                <span>Merchant Dashboard · v0.1.0</span>
              </footer>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                {active}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Halaman ini akan kita bangun berikutnya.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  positive,
  warning,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          {title}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </span>
      </div>

      <div className="font-[Plus_Jakarta_Sans] text-[23px] font-extrabold tracking-tight text-slate-900">
        {value}
      </div>

      <div
        className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${
          warning
            ? "text-amber-600"
            : positive
              ? "text-emerald-600"
              : "text-slate-400"
        }`}
      >
        {positive && <ArrowUpRight size={12} />}
        {warning && <ArrowDownRight size={12} />}
        {change}
      </div>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Selesai: "bg-emerald-50 text-emerald-700",
    Menunggu: "bg-amber-50 text-amber-700",
    Diproses: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-[10px] font-bold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
