"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  Boxes,
  CheckCircle2,
  Clock3,
  Link2,
  Package,
  RefreshCw,
  ShoppingBag,
  Zap,
} from "lucide-react";

type Subscription = {
  id: string;
  planKey: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  amount: number | null;
  currency: string;
  maxProducts: number;
  maxOrdersPerMonth: number;
  active: boolean;
};

type Product = {
  id: string;
  itemkuProductId: number;
  name: string;
  gameName: string | null;
  itemTypeName: string | null;
  price: number;
  stock: number;
  fulfillmentMode: string;
  usingDeliveryInfo: boolean;
  deliveryInfoFields: string | null;
  minimumOrder: number;
  baseUnit: number;
  digiflazzProductCode?: string | null;
  isActive: boolean;
  syncedAt: string | null;
};

type DashboardData = {
  connected: boolean;
  webhookUrl: string | null;
  connection: {
    id: string;
    name: string | null;
    status: string;
    connectedAt: string | null;
  } | null;
};

function parseDeliveryInfoFields(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((field) => {
        if (!field || typeof field !== "object") return null;

        const record = field as Record<string, unknown>;
        return typeof record.field_name === "string"
          ? record.field_name.trim()
          : null;
      })
      .filter((name): name is string => Boolean(name));
  } catch {
    return [];
  }
}

export default function ItemkuAutomationPage() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    connected: false,
    webhookUrl: null,
    connection: null,
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockInput, setStockInput] = useState("");
  const [savingStock, setSavingStock] = useState(false);
  const [fulfillmentMode, setFulfillmentMode] = useState("MANUAL_STOCK");
  const [digiflazzProductCode, setDigiflazzProductCode] = useState("");
  const [savingFulfillment, setSavingFulfillment] = useState(false);
  const [syncingStock, setSyncingStock] = useState(false);
  const [stockSummary, setStockSummary] = useState<{
    available: number;
    reserved: number;
    delivered: number;
  } | null>(null);



  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [connectionResponse, subscriptionResponse, productResponse] =
        await Promise.all([
          fetch("/api/itemku", { cache: "no-store" }),
          fetch("/api/itemku/subscription", { cache: "no-store" }),
          fetch("/api/itemku/products", { cache: "no-store" }),
        ]);

      const connectionData = await connectionResponse.json();
      const subscriptionData = await subscriptionResponse.json();
      const productData = await productResponse.json();

      if (!connectionResponse.ok) {
        throw new Error(connectionData.error || "Gagal mengambil koneksi Itemku.");
      }

      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionData.error || "Gagal mengambil subscription.");
      }

      if (!productResponse.ok) {
        throw new Error(productData.error || "Gagal mengambil produk.");
      }

      setDashboard(connectionData);
      setSubscription(subscriptionData.subscription);
      setProducts(productData.products || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat dashboard Itemku."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const syncProducts = async () => {
    setSyncing(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/itemku/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sinkronisasi produk gagal.");
      }

      setMessage(data.message || "Produk berhasil disinkronkan.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sinkronisasi produk gagal."
      );
    } finally {
      setSyncing(false);
    }
  };


  const copyWebhookUrl = async () => {
    if (!dashboard.webhookUrl) return;

    try {
      await navigator.clipboard.writeText(dashboard.webhookUrl);
      setMessage("URL webhook berhasil disalin.");
      setError("");
    } catch {
      setError("Gagal menyalin URL webhook. Silakan salin secara manual.");
    }
  };

  const connectItemku = async () => {
    setConnecting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/itemku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secretKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Koneksi Itemku gagal.");
      }

      setApiKey("");
      setSecretKey("");
      setMessage("Akun Itemku berhasil dihubungkan.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Koneksi Itemku gagal."
      );
    } finally {
      setConnecting(false);
    }
  };

  const disconnectItemku = async () => {
    if (!window.confirm("Putuskan koneksi akun Itemku?")) return;

    setConnecting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/itemku", { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memutuskan koneksi.");
      }

      setMessage("Koneksi Itemku berhasil diputuskan.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memutuskan koneksi."
      );
    } finally {
      setConnecting(false);
    }
  };


  const openStockManager = async (product: Product) => {
    setSelectedProduct(product);
    setStockInput("");
    setStockSummary(null);
    setFulfillmentMode(product.fulfillmentMode || "MANUAL_STOCK");
    setDigiflazzProductCode(product.digiflazzProductCode || "");

    try {
      const response = await fetch(
        `/api/itemku/products/${product.id}/stock`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil ringkasan stok.");
      }

      setStockSummary(data.stock);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil ringkasan stok."
      );
    }
  };

  const saveFulfillment = async () => {
    if (!selectedProduct) return;

    if (
      fulfillmentMode === "DIGIFLAZZ" &&
      !digiflazzProductCode.trim()
    ) {
      setError("Masukkan kode produk Digiflazz.");
      return;
    }

    setSavingFulfillment(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/itemku/products/${selectedProduct.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fulfillmentMode,
            digiflazzProductCode:
              fulfillmentMode === "DIGIFLAZZ"
                ? digiflazzProductCode.trim()
                : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan fulfillment.");
      }

      setMessage("Pengaturan fulfillment berhasil disimpan.");
      await loadData();

      setSelectedProduct((current) =>
        current
          ? {
              ...current,
              fulfillmentMode,
              digiflazzProductCode:
                fulfillmentMode === "DIGIFLAZZ"
                  ? digiflazzProductCode.trim()
                  : null,
            }
          : null
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan fulfillment."
      );
    } finally {
      setSavingFulfillment(false);
    }
  };

  const syncStockToItemku = async () => {
    if (!selectedProduct) return;

    if (fulfillmentMode !== "MANUAL_STOCK") {
      setError("Sinkronisasi hanya tersedia untuk Manual Stock.");
      return;
    }

    setSyncingStock(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/itemku/products/${selectedProduct.id}/sync-stock`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyinkronkan stok.");
      }

      setMessage(data.message || "Stok berhasil disinkronkan ke Itemku.");
      await openStockManager(selectedProduct);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyinkronkan stok."
      );
    } finally {
      setSyncingStock(false);
    }
  };

  const saveStock = async () => {
    if (!selectedProduct) return;

    const lines = stockInput
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError("Masukkan minimal satu item stok.");
      return;
    }

    if (lines.length > 100) {
      setError("Maksimal 100 item stok dalam satu kali proses.");
      return;
    }

    const deliveryFields = parseDeliveryInfoFields(
      selectedProduct.deliveryInfoFields
    );

    let stockItems: string[];

    if (deliveryFields.length > 0) {
      try {
        stockItems = lines.map((line, index) => {
          const parsed: unknown = JSON.parse(line);

          if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
          ) {
            throw new Error(`Item ${index + 1} harus berupa objek JSON.`);
          }

          const record = parsed as Record<string, unknown>;
          const keys = Object.keys(record);

          if (
            keys.length !== deliveryFields.length ||
            deliveryFields.some(
              (field) =>
                typeof record[field] !== "string" ||
                !(record[field] as string).trim()
            ) ||
            keys.some((key) => !deliveryFields.includes(key))
          ) {
            throw new Error(
              `Item ${index + 1} harus memiliki field: ${deliveryFields.join(", ")}.`
            );
          }

          return JSON.stringify(record);
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Format data akun tidak valid."
        );
        return;
      }
    } else {
      stockItems = lines;
    }

    setSavingStock(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/itemku/products/${selectedProduct.id}/stock`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stockItems }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan stok.");
      }

      setMessage(data.message || "Stok berhasil disimpan.");
      setStockInput("");
      await openStockManager(selectedProduct);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan stok."
      );
    } finally {
      setSavingStock(false);
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const availableStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Zap size={16} />
            AUTOMATION PLATFORM
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Itemku Automation
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Kelola produk, stok, dan otomatisasi pesanan Itemku dari satu
            dashboard ORDERLY.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Subscription
            </span>
            <Zap size={19} className="text-blue-600" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-900">
            {loading ? "..." : subscription?.active ? "Aktif" : "Tidak Aktif"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {subscription?.planKey || "Belum berlangganan"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Koneksi Itemku
            </span>
            <Link2 size={19} className="text-blue-600" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-900">
            {loading ? "..." : dashboard.connected ? "Terhubung" : "Belum Terhubung"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {dashboard.connection?.name || "Akun Itemku Seller"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Produk
            </span>
            <Package size={19} className="text-blue-600" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-900">
            {loading ? "..." : products.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Batas {subscription?.maxProducts ?? 0} produk
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Stok
            </span>
            <Boxes size={19} className="text-blue-600" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-900">
            {loading ? "..." : availableStock}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Jumlah stok tercatat
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Koneksi Itemku</h2>
              <p className="text-xs text-slate-500">
                Integrasi akun seller milik merchant
              </p>
            </div>
            <div className="ml-auto">
              {dashboard.connected ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Terhubung
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  Belum terhubung
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              {dashboard.connection?.name || "Itemku Seller Account"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Terhubung sejak {formatDate(dashboard.connection?.connectedAt || null)}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {!dashboard.connected ? (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Itemku API Key
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="Masukkan API Key"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Itemku Secret Key
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={secretKey}
                    onChange={(event) => setSecretKey(event.target.value)}
                    placeholder="Masukkan Secret Key"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={connectItemku}
                  disabled={connecting || !apiKey.trim() || !secretKey.trim()}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {connecting ? "Menghubungkan..." : "Hubungkan Akun Itemku"}
                </button>
              </>
            ) : (
              <button
                onClick={disconnectItemku}
                disabled={connecting}
                className="w-full rounded-xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                {connecting ? "Memproses..." : "Putuskan Koneksi"}
              </button>
            )}
          </div>

          {dashboard.connected && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center gap-2">
                <Link2 size={17} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Webhook Callback Itemku
                </h3>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Gunakan URL ini sebagai endpoint callback pesanan Itemku.
                Pastikan domain publik ORDERLY aktif dan DNS TXT verifikasi
                Itemku sudah dikonfigurasi.
              </p>
              <div className="mt-3 break-all rounded-lg border border-blue-100 bg-white p-3 text-xs text-slate-700">
                {dashboard.webhookUrl || "URL webhook belum tersedia. Periksa APP_URL."}
              </div>
              <button
                type="button"
                onClick={copyWebhookUrl}
                disabled={!dashboard.webhookUrl}
                className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Salin URL Webhook
              </button>
            </div>
          )}

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Kredensial dikirim langsung ke backend ORDERLY dan disimpan
            terenkripsi. Jangan membagikan API Key atau Secret Key kepada
            siapa pun.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Activity size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Subscription Itemku</h2>
              <p className="text-xs text-slate-500">Paket automasi terpisah</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Paket</span>
              <span className="font-bold text-slate-800">
                {subscription?.planKey || "Belum ada"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Berakhir</span>
              <span className="font-bold text-slate-800">
                {formatDate(subscription?.endsAt || null)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Batas pesanan/bulan</span>
              <span className="font-bold text-slate-800">
                {subscription?.maxOrdersPerMonth ?? 0}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-bold text-slate-900">Produk Itemku</h2>
            <p className="mt-1 text-xs text-slate-500">
              Produk seller yang tersimpan di database ORDERLY
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={page}
              onChange={(event) => setPage(Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <option key={value} value={value}>
                  Halaman {value}
                </option>
              ))}
            </select>

            <button
              onClick={syncProducts}
              disabled={syncing || loading || !dashboard.connected || !subscription?.active}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowDownToLine size={16} />
              {syncing ? "Menyinkronkan..." : "Sync Produk"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Memuat produk...
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <Package size={30} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">
              Belum ada produk
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Hubungkan akun Itemku dan aktifkan subscription untuk mulai
              menyinkronkan produk.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Produk</th>
                  <th className="px-5 py-4 font-bold">Harga</th>
                  <th className="px-5 py-4 font-bold">Stok</th>
                  <th className="px-5 py-4 font-bold">Fulfillment</th>
                  <th className="px-5 py-4 font-bold">Sinkronisasi</th>
                  <th className="px-5 py-4 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {product.gameName || product.itemTypeName || `ID ${product.itemkuProductId}`}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {product.stock}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        {product.fulfillmentMode === "DIGIFLAZZ"
                          ? "Digiflazz"
                          : "Manual Stock"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(product.syncedAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openStockManager(product)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Kelola Produk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Kelola Stok
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedProduct.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-800">
                Metode Fulfillment
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Tentukan sumber pemenuhan pesanan untuk produk ini.
              </p>

              <select
                value={fulfillmentMode}
                onChange={(event) => setFulfillmentMode(event.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="MANUAL_STOCK">Manual Stock</option>
                <option value="DIGIFLAZZ">Digiflazz</option>
              </select>

              {fulfillmentMode === "DIGIFLAZZ" && (
                <div className="mt-3">
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Kode Produk Digiflazz
                  </label>
                  <input
                    value={digiflazzProductCode}
                    onChange={(event) =>
                      setDigiflazzProductCode(event.target.value)
                    }
                    placeholder="Contoh: MLBB10"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                  <p className="mt-2 text-xs leading-5 text-amber-700">
                    Konfigurasi supplier disimpan, tetapi transaksi otomatis
                    Digiflazz belum diaktifkan.
                  </p>
                </div>
              )}

              <button
                onClick={saveFulfillment}
                disabled={savingFulfillment}
                className="mt-3 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                {savingFulfillment ? "Menyimpan..." : "Simpan Fulfillment"}
              </button>
            </div>

            {fulfillmentMode === "MANUAL_STOCK" && (
              <>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: "Tersedia", value: stockSummary?.available ?? "..." },
                  { label: "Dipesan", value: stockSummary?.reserved ?? "..." },
                  { label: "Terkirim", value: stockSummary?.delivered ?? "..." },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Tambahkan stok
                </label>
                <textarea
                  rows={7}
                  value={stockInput}
                  onChange={(event) => setStockInput(event.target.value)}
                  placeholder={
                    parseDeliveryInfoFields(selectedProduct.deliveryInfoFields).length > 0
                      ? parseDeliveryInfoFields(selectedProduct.deliveryInfoFields)
                          .map((field) => `"${field}": "isi data"`)
                          .join(", ")
                          .replace(/^/, "{")
                          .concat("}")
                      : "KODE-VOUCHER-1\\nKODE-VOUCHER-2\\nKODE-VOUCHER-3"
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {parseDeliveryInfoFields(selectedProduct.deliveryInfoFields).length > 0
                    ? `Satu objek JSON per baris. Gunakan field: ${parseDeliveryInfoFields(selectedProduct.deliveryInfoFields).join(", ")}.`
                    : "Satu kode voucher per baris."} Maksimal 100 item setiap penyimpanan.
                </p>

                <button
                  onClick={syncStockToItemku}
                  disabled={syncingStock || savingStock}
                  className="mt-3 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  {syncingStock
                    ? "Menyinkronkan..."
                    : "Sinkronkan Stok ke Itemku"}
                </button>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Mengirim jumlah stok tersedia dari ORDERLY ke marketplace Itemku.
                </p>
              </div>

              </>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                onClick={saveStock}
                disabled={savingStock || !stockInput.trim()}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingStock ? "Menyimpan..." : "Simpan Stok"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <Clock3 size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-xs leading-5 text-blue-800">
          Dashboard ini merupakan tahap awal. Pengelolaan stok, pengaturan
          fulfillment, pemrosesan pesanan, dan sinkronisasi stok ke Itemku
          akan dihubungkan secara bertahap.
        </p>
      </div>
    </div>
  );
}
