"use client";

import { useCallback, useEffect, useState } from "react";
import StoreEditorPage from "@/components/dashboard/store-editor-page";
import {
  Globe,
  LayoutTemplate,
  Loader2,
  Plus,
  RefreshCw,
  Palette,
  ExternalLink,
  Layers3,
  Monitor,
  Settings2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type StoreWebsite = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  themeKey: string;
  status: string;
  publishedVersion: number;
  publishedAt?: string | null;
  pages?: Array<{
    id: string;
    title: string;
    path: string;
    sections?: Array<{ id: string; type: string; name: string }>;
  }>;
};

const templates = [
  {
    key: "minimal",
    name: "Minimal",
    description: "Bersih, sederhana, dan fokus pada produk.",
    preview: "bg-slate-100",
  },
  {
    key: "streetwear",
    name: "Streetwear",
    description: "Karakter berani untuk brand fashion.",
    preview: "bg-stone-900",
  },
  {
    key: "premium",
    name: "Premium",
    description: "Tampilan elegan dan eksklusif.",
    preview: "bg-amber-50",
  },
  {
    key: "digital",
    name: "Digital",
    description: "Cocok untuk produk dan layanan digital.",
    preview: "bg-blue-50",
  },
];

export default function StoreBuilderPage() {
  const [website, setWebsite] = useState<StoreWebsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [themeKey, setThemeKey] = useState("minimal");

  const loadWebsite = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/store", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat website.");
      }

      setWebsite(data.website || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWebsite();
  }, [loadWebsite]);

  function handleNameChange(value: string) {
    setName(value);

    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30)
    );
  }

  async function createWebsite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          themeKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat website.");
      }

      setWebsite(data.website);
      setNotice("Website berhasil dibuat. Selanjutnya kamu bisa mulai mengedit toko.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal membuat website."
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Globe size={24} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">
            ORDERLY WEBSITE STORE
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Buat website tokomu sendiri.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Bangun storefront profesional untuk menampilkan produk dan
            menerima pesanan melalui ekosistem ORDERLY.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        <form
          onSubmit={createWebsite}
          className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h3 className="font-bold text-slate-900">
              Informasi website
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Tentukan identitas awal website tokomu.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Nama toko
                </label>

                <input
                  required
                  minLength={2}
                  maxLength={60}
                  value={name}
                  onChange={(event) =>
                    handleNameChange(event.target.value)
                  }
                  placeholder="Contoh: Genta Store"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Alamat website
                </label>

                <div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-blue-500">
                  <input
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    value={slug}
                    onChange={(event) =>
                      setSlug(
                        event.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                          .slice(0, 30)
                      )
                    }
                    className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
                  />

                  <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-xs text-slate-500">
                    .orderly.id
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-slate-400">
                  Contoh: gentastore.orderly.id
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Deskripsi toko
                </label>

                <textarea
                  maxLength={500}
                  rows={3}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Ceritakan secara singkat tentang tokomu..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h3 className="font-bold text-slate-900">
              Pilih template
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Template dapat dikustomisasi melalui editor.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {templates.map((template) => {
                const selected = themeKey === template.key;

                return (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => setThemeKey(template.key)}
                    className={`overflow-hidden rounded-xl border text-left transition ${
                      selected
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`flex h-20 items-center justify-center ${template.preview}`}
                    >
                      <LayoutTemplate
                        size={28}
                        className={
                          template.key === "streetwear"
                            ? "text-white"
                            : "text-slate-500"
                        }
                      />
                    </div>

                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {template.name}
                        </span>

                        {selected && (
                          <CheckCircle2
                            size={15}
                            className="text-blue-600"
                          />
                        )}
                      </div>

                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {template.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={creating || !name.trim() || !slug.trim()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Plus size={17} />
              )}
              {creating ? "Membuat website..." : "Buat website"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-blue-600">
            WEBSITE STORE
          </p>

          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
            {website.name}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {website.slug}.orderly.id
          </p>
        </div>

        <button
          onClick={loadWebsite}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Globe className="text-blue-600" size={21} />
          <p className="mt-4 text-xs text-slate-500">Status website</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {website.status === "PUBLISHED" ? "Published" : "Draft"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Layers3 className="text-blue-600" size={21} />
          <p className="mt-4 text-xs text-slate-500">Total halaman</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {website.pages?.length || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Palette className="text-blue-600" size={21} />
          <p className="mt-4 text-xs text-slate-500">Versi publikasi</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            V{website.publishedVersion}
          </p>
        </div>
      </div>

      <StoreEditorPage />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Monitor size={21} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Visual Store Editor
              </h3>
              <p className="text-xs text-slate-500">
                Advanced Hybrid Builder
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { icon: Layers3, label: "Layers" },
              { icon: Monitor, label: "Canvas" },
              { icon: Settings2, label: "Inspector" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"
              >
                <item.icon size={20} className="text-slate-500" />
                <span className="text-[11px] font-semibold text-slate-600">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Editor visual akan memungkinkan kamu menyusun section,
            mengatur layout, dan mengubah tampilan toko melalui satu
            workspace.
          </p>

          <div className="mt-5 rounded-xl bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-700">
              Section Editor tersedia
            </p>
            <p className="mt-1 text-[11px] leading-5 text-blue-600">
              Kamu sudah bisa menambahkan, menghapus, dan mengatur urutan section.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="font-bold text-slate-900">Halaman website</h3>

          <div className="mt-4 space-y-3">
            {(website.pages || []).map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {page.title}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {page.path}
                  </p>
                </div>

                <span className="text-[10px] text-slate-400">
                  {page.sections?.length || 0} section
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] leading-5 text-slate-500">
              <ExternalLink size={13} className="mr-1 inline" />
              Subdomain akan aktif setelah konfigurasi domain dan
              renderer publik selesai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
