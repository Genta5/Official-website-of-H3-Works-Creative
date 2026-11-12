"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  X,
  Boxes,
  CircleDollarSign,
} from "lucide-react";
import type { Product, ProductStatus } from "@/lib/types";
import { storage } from "@/lib/storage";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Digital",
  status: "active" as ProductStatus,
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal mengambil produk.");
        }

        let serverProducts = Array.isArray(data.products)
          ? data.products
          : [];

        // Migrasi data lama dari browser jika database masih kosong.
        if (serverProducts.length === 0) {
          const legacyProducts = storage.getProducts();

          if (legacyProducts.length > 0) {
            for (const product of legacyProducts) {
              const migrationResponse = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: product.name,
                  description: product.description || "",
                  price: product.price,
                  stock: product.stock,
                  category: product.category,
                  status: product.status,
                }),
              });

              const migrationData = await migrationResponse.json();

              if (!migrationResponse.ok) {
                throw new Error(
                  migrationData.error || "Migrasi produk lama gagal."
                );
              }
            }

            const refreshed = await fetch("/api/products", {
              cache: "no-store",
            });
            const refreshedData = await refreshed.json();

            if (!refreshed.ok) {
              throw new Error("Gagal memuat produk setelah migrasi.");
            }

            serverProducts = refreshedData.products || [];
            storage.saveProducts([]);
          }
        }

        if (!cancelled) {
          setProducts(serverProducts);
          setPageError("");
        }
      } catch (err) {
        if (!cancelled) {
          setPageError(
            err instanceof Error
              ? err.message
              : "Gagal memuat produk dari database."
          );
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        `${product.name} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" || product.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const activeCount = products.filter(
    (product) => product.status === "active"
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      status: product.status,
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }

    if (!form.price.trim() || !Number.isSafeInteger(price) || price < 0) {
      setError("Masukkan harga yang valid.");
      return;
    }

    if (
      !form.stock.trim() ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      setError("Stok harus berupa bilangan bulat positif atau nol.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          stock,
          category: form.category,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan produk.");
      }

      if (editingId) {
        setProducts((current) =>
          current.map((product) =>
            product.id === editingId ? data.product : product
          )
        );
      } else {
        setProducts((current) => [data.product, ...current]);
      }

      setModalOpen(false);
      setForm(emptyForm);
      setError("");
      setPageError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan produk."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus produk ini?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus produk.");
      }

      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );
      setPageError("");
    } catch (err) {
      setPageError(
        err instanceof Error ? err.message : "Gagal menghapus produk."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">
            Kelola katalog produk tokomu.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Data produk tersimpan di database ORDERLY.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
        >
          <Plus size={17} />
          Tambah produk
        </button>
      </div>

      {pageError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {pageError}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total produk"
          value={products.length}
          icon={<Package size={19} />}
        />
        <SummaryCard
          title="Produk aktif"
          value={activeCount}
          icon={<CircleDollarSign size={19} />}
        />
        <SummaryCard
          title="Total stok"
          value={totalStock}
          icon={<Boxes size={19} />}
        />
      </div>

      {/* Product table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Katalog produk
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {filteredProducts.length} produk ditemukan
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
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
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-4 py-4">Kategori</th>
                  <th className="px-4 py-4">Harga</th>
                  <th className="px-4 py-4">Stok</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
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
                      <p className="mt-1 max-w-[220px] truncate text-[10px] text-slate-400">
                        {product.description || "Tidak ada deskripsi"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {product.category}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-700">
                      {rupiah(product.price)}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {product.stock}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          product.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {product.status === "active"
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          aria-label="Edit produk"
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => deleteProduct(product.id)}
                          aria-label="Hapus produk"
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
              <Package size={27} className="text-slate-300" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-700">
              Produk belum ditemukan
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tambahkan produk atau ubah kata pencarianmu.
            </p>
          </div>
        )}
      </section>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-[3px] sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingId ? "Edit produk" : "Tambah produk"}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Lengkapi informasi produk tokomu.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup modal"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal form */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(100dvh-150px)] space-y-5 overflow-y-auto px-5 py-6 sm:px-7"
            >
              <FormField label="Nama produk">
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Contoh: Canva Pro 1 Bulan"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Deskripsi">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Jelaskan produk secara singkat..."
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Deskripsi membantu pelanggan memahami produkmu.
                </p>
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Harga (Rp)">
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="25000"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Stok">
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) =>
                      setForm({ ...form, stock: event.target.value })
                    }
                    placeholder="10"
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Kategori">
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className={inputClass}
                  >
                    <option>Digital</option>
                    <option>Fisik</option>
                    <option>Jasa</option>
                    <option>Preorder</option>
                    <option>Lainnya</option>
                  </select>
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as ProductStatus,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </FormField>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs text-rose-600">
                  <span className="font-bold">!</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Modal footer */}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <Plus size={16} />
                  {isSaving ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Simpan produk"}
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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{title}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-slate-900">
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-xs font-bold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
