"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Boxes,
  Package,
  AlertTriangle,
  PackageX,
  Plus,
  Minus,
  X,
  History,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { storage } from "@/lib/storage";

type StockFilter = "all" | "available" | "low" | "empty";

interface StockHistory {
  id: string;
  productName: string;
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
}

const HISTORY_KEY = "orderly_inventory_history";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] =
    useState<"add" | "subtract">("add");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("Penyesuaian stok");
  const [error, setError] = useState("");

  useEffect(() => {
    setProducts(storage.getProducts());

    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      storage.saveProducts(products);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [products, history, loaded]);

  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const emptyStock = products.filter(
    (product) => product.stock === 0
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        `${product.name} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(keyword);

      const matchesFilter =
        filter === "all" ||
        (filter === "available" && product.stock > 5) ||
        (filter === "low" &&
          product.stock > 0 &&
          product.stock <= 5) ||
        (filter === "empty" && product.stock === 0);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const openAdjustment = (
    product: Product,
    type: "add" | "subtract"
  ) => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setQuantity("1");
    setReason(
      type === "add" ? "Penambahan stok" : "Penyesuaian stok"
    );
    setError("");
  };

  const closeAdjustment = () => {
    setSelectedProduct(null);
    setError("");
  };

  const handleAdjustment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) return;

    const amount = Number(quantity);

    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Jumlah harus berupa bilangan bulat lebih dari 0.");
      return;
    }

    const change = adjustmentType === "add" ? amount : -amount;
    const newStock = selectedProduct.stock + change;

    if (newStock < 0) {
      setError("Stok tidak mencukupi untuk pengurangan ini.");
      return;
    }

    const updatedProduct = {
      ...selectedProduct,
      stock: newStock,
    };

    const updatedProducts = products.map((product) =>
      product.id === selectedProduct.id
        ? updatedProduct
        : product
    );

    const newHistory: StockHistory = {
      id:
        globalThis.crypto?.randomUUID?.() ??
        `history-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      productName: selectedProduct.name,
      change,
      previousStock: selectedProduct.stock,
      newStock,
      reason: reason.trim() || "Penyesuaian stok",
      createdAt: new Date().toISOString(),
    };

    setProducts(updatedProducts);
    setHistory((current) => [newHistory, ...current].slice(0, 50));
    closeAdjustment();
  };

  const stockLabel = (stock: number) => {
    if (stock === 0) return "Stok habis";
    if (stock <= 5) return "Stok menipis";
    return "Tersedia";
  };

  const stockStyle = (stock: number) => {
    if (stock === 0) return "bg-red-50 text-red-700";
    if (stock <= 5) return "bg-amber-50 text-amber-700";
    return "bg-emerald-50 text-emerald-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-slate-500">
          Pantau dan atur persediaan produk tokomu.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Perubahan stok juga akan diperbarui di halaman Products.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total produk"
          value={products.length}
          icon={<Package size={19} />}
          color="blue"
        />
        <SummaryCard
          title="Stok tersedia"
          value={totalStock}
          icon={<Boxes size={19} />}
          color="green"
        />
        <SummaryCard
          title="Stok menipis"
          value={lowStock}
          icon={<AlertTriangle size={19} />}
          color="amber"
        />
        <SummaryCard
          title="Stok habis"
          value={emptyStock}
          icon={<PackageX size={19} />}
          color="red"
        />
      </div>

      {/* Inventory table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Persediaan produk
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {filteredProducts.length} produk ditemukan
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari produk..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-44"
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as StockFilter)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
            >
              <option value="all">Semua stok</option>
              <option value="available">Tersedia</option>
              <option value="low">Stok menipis</option>
              <option value="empty">Stok habis</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Jumlah stok</th>
                <th className="px-4 py-3">Status stok</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="text-xs transition hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">
                      {product.name}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {product.description || "Tidak ada deskripsi"}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-slate-500">
                    {product.category}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-700">
                    {rupiah(product.price)}
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-800">
                      {product.stock}
                    </span>
                    <span className="ml-1 text-slate-400">unit</span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-bold ${stockStyle(product.stock)}`}
                    >
                      {stockLabel(product.stock)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openAdjustment(product, "add")}
                        title="Tambah stok"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50"
                      >
                        <Plus size={15} />
                      </button>

                      <button
                        onClick={() => openAdjustment(product, "subtract")}
                        title="Kurangi stok"
                        disabled={product.stock === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="p-10 text-center">
              <Package size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Produk tidak ditemukan.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Tambahkan produk melalui halaman Products.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stock history */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <History size={17} className="text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Riwayat perubahan stok
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Maksimal 50 aktivitas terakhir.
          </p>
        </div>

        {history.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {history.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      item.change > 0
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {item.change > 0 ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.reason} · {item.previousStock} → {item.newStock} unit
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span
                    className={`text-xs font-bold ${
                      item.change > 0
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {item.change > 0 ? "+" : ""}
                    {item.change} unit
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <History size={25} className="mx-auto text-slate-300" />
            <p className="mt-3 text-xs text-slate-500">
              Belum ada riwayat perubahan stok.
            </p>
          </div>
        )}
      </section>

      {/* Adjustment modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAdjustment();
          }}
        >
          <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Penyesuaian stok
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedProduct.name}
                </p>
              </div>

              <button
                onClick={closeAdjustment}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustment} className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Stok saat ini
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {selectedProduct.stock}{" "}
                  <span className="text-sm font-medium text-slate-400">
                    unit
                  </span>
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Jenis penyesuaian
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType("add");
                      setError("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                      adjustmentType === "add"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <Plus size={15} />
                    Tambah stok
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType("subtract");
                      setError("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                      adjustmentType === "subtract"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <Minus size={15} />
                    Kurangi stok
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Jumlah unit
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className={inputClass}
                  placeholder="Masukkan jumlah"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Alasan perubahan
                </label>
                <input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className={inputClass}
                  placeholder="Contoh: Restock produk"
                  maxLength={100}
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAdjustment}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                >
                  Simpan perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          {title}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </span>
      </div>

      <div className="font-[Plus_Jakarta_Sans] text-[23px] font-extrabold tracking-tight text-slate-900">
        {value.toLocaleString("id-ID")}
      </div>
    </div>
  );
}
