"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers3,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  LayoutTemplate,
  Settings2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

type Settings = Record<string, string | number | boolean>;

type StorePage = {
  id: string;
  title: string;
  path: string;
  isHome?: boolean;
};

type StoreSection = {
  id: string;
  type: string;
  name: string;
  settings: string;
  sortOrder: number;
  isVisible: boolean;
};

type InspectorField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "color" | "url";
  placeholder?: string;
};

const sectionLibrary = [
  { type: "HEADER", name: "Header", description: "Navigasi dan identitas toko" },
  { type: "HERO", name: "Hero Banner", description: "Banner utama halaman" },
  { type: "RICH_TEXT", name: "Rich Text", description: "Judul dan deskripsi" },
  { type: "IMAGE", name: "Image", description: "Gambar utama" },
  { type: "IMAGE_GALLERY", name: "Image Gallery", description: "Galeri beberapa gambar" },
  { type: "PRODUCT_GRID", name: "Product Grid", description: "Daftar produk toko" },
  { type: "FEATURED_PRODUCT", name: "Featured Product", description: "Produk unggulan" },
  { type: "CATEGORIES", name: "Categories", description: "Kategori produk" },
  { type: "PROMO_BANNER", name: "Promo Banner", description: "Informasi promosi" },
  { type: "TESTIMONIALS", name: "Testimonials", description: "Ulasan pelanggan" },
  { type: "FAQ", name: "FAQ", description: "Pertanyaan umum" },
  { type: "FOOTER", name: "Footer", description: "Informasi bagian bawah toko" },
];

const commonFields: InspectorField[] = [
  { key: "heading", label: "Heading", placeholder: "Judul section" },
  { key: "subheading", label: "Subheading", placeholder: "Subjudul section" },
  { key: "description", label: "Deskripsi", type: "textarea", placeholder: "Tulis deskripsi..." },
  { key: "backgroundColor", label: "Warna background", type: "color" },
  { key: "textColor", label: "Warna teks", type: "color" },
];

const fieldsByType: Record<string, InspectorField[]> = {
  HEADER: [
    { key: "logoText", label: "Teks logo", placeholder: "Nama toko" },
    { key: "menuText", label: "Teks navigasi", placeholder: "Home, Shop, About" },
    ...commonFields.slice(3),
  ],
  HERO: [
    ...commonFields,
    { key: "buttonText", label: "Teks tombol", placeholder: "Belanja sekarang" },
    { key: "buttonUrl", label: "Link tombol", type: "url", placeholder: "/shop" },
    { key: "imageUrl", label: "URL gambar", type: "url", placeholder: "https://..." },
    { key: "layout", label: "Layout", placeholder: "center / split / left" },
  ],
  RICH_TEXT: commonFields,
  IMAGE: [
    { key: "imageUrl", label: "URL gambar", type: "url", placeholder: "https://..." },
    { key: "alt", label: "Alt text", placeholder: "Deskripsi gambar" },
    { key: "caption", label: "Caption", type: "textarea" },
    ...commonFields.slice(3),
  ],
  IMAGE_GALLERY: [
    ...commonFields,
    { key: "imageUrls", label: "URL gambar (satu URL per baris)", type: "textarea" },
    { key: "columns", label: "Jumlah kolom", type: "number" },
  ],
  PRODUCT_GRID: [
    ...commonFields,
    { key: "columns", label: "Jumlah kolom", type: "number" },
    { key: "productLimit", label: "Jumlah produk", type: "number" },
  ],
  FEATURED_PRODUCT: [
    ...commonFields,
    { key: "productId", label: "ID produk", placeholder: "ID produk" },
    { key: "buttonText", label: "Teks tombol", placeholder: "Lihat produk" },
  ],
  CATEGORIES: [
    ...commonFields,
    { key: "columns", label: "Jumlah kolom", type: "number" },
  ],
  PROMO_BANNER: [
    ...commonFields,
    { key: "buttonText", label: "Teks tombol", placeholder: "Lihat promo" },
    { key: "buttonUrl", label: "Link tombol", type: "url" },
  ],
  TESTIMONIALS: [
    ...commonFields,
    { key: "items", label: "Konten testimonial", type: "textarea", placeholder: "Nama: komentar..." },
  ],
  FAQ: [
    ...commonFields,
    { key: "items", label: "Daftar pertanyaan dan jawaban", type: "textarea", placeholder: "Pertanyaan: Jawaban..." },
  ],
  FOOTER: [
    { key: "heading", label: "Judul footer" },
    { key: "description", label: "Deskripsi", type: "textarea" },
    { key: "copyright", label: "Copyright", placeholder: "© 2026 Nama Toko" },
    ...commonFields.slice(3),
  ],
};

function parseSettings(value: string): Settings {
  try {
    const parsed = JSON.parse(value || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Settings;
    }
  } catch {
    // Gunakan konfigurasi kosong jika JSON lama tidak valid.
  }

  return {};
}

export default function StoreEditorPage() {
  const [pages, setPages] = useState<StorePage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [sections, setSections] = useState<StoreSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingType, setAddingType] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [inspectorName, setInspectorName] = useState("");
  const [inspectorSettings, setInspectorSettings] = useState<Settings>({});
  const [inspectorVisible, setInspectorVisible] = useState(true);

  const selectedSection = sections.find(
    (section) => section.id === selectedSectionId
  ) || null;

  const loadSections = useCallback(async () => {
    if (!selectedPageId) {
      setSections([]);
      setSelectedSectionId("");
      return;
    }

    try {
      const response = await fetch(
        `/api/store/pages/${selectedPageId}/sections`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat section.");
      }

      const items: StoreSection[] = data.sections || [];
      setSections(items);

      setSelectedSectionId((current) =>
        items.some((item) => item.id === current)
          ? current
          : items[0]?.id || ""
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat section."
      );
    }
  }, [selectedPageId]);

  const loadPages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/store/pages", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat halaman.");
      }

      const items: StorePage[] = data.pages || [];
      setPages(items);

      if (items.length > 0) {
        setSelectedPageId((current) =>
          items.some((page) => page.id === current)
            ? current
            : items.find((page) => page.isHome)?.id || items[0].id
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat halaman."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    if (!selectedSection) {
      setInspectorName("");
      setInspectorSettings({});
      setInspectorVisible(true);
      return;
    }

    setInspectorName(selectedSection.name);
    setInspectorSettings(parseSettings(selectedSection.settings));
    setInspectorVisible(selectedSection.isVisible);
  }, [selectedSection]);

  async function addSection(type: string, name: string) {
    if (!selectedPageId || saving) return;

    setSaving(true);
    setAddingType(type);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/store/pages/${selectedPageId}/sections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, name, settings: {} }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menambahkan section.");
      }

      await loadSections();
      setSelectedSectionId(data.section.id);
      setNotice(`${name} berhasil ditambahkan.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menambahkan section."
      );
    } finally {
      setSaving(false);
      setAddingType("");
    }
  }

  async function saveInspector() {
    if (!selectedSection || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/store/sections/${selectedSection.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: inspectorName,
            settings: inspectorSettings,
            isVisible: inspectorVisible,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan pengaturan.");
      }

      await loadSections();
      setNotice("Pengaturan section berhasil disimpan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSection(sectionId: string) {
    if (saving) return;

    if (!window.confirm("Hapus section ini dari halaman?")) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/store/sections/${sectionId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus section.");
      }

      await loadSections();
      setNotice("Section berhasil dihapus.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghapus section."
      );
    } finally {
      setSaving(false);
    }
  }

  async function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (
      saving ||
      targetIndex < 0 ||
      targetIndex >= sections.length
    ) {
      return;
    }

    const reordered = [...sections];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];

    setSaving(true);
    setError("");
    setNotice("");

    try {
      for (let i = 0; i < reordered.length; i++) {
        const response = await fetch(
          `/api/store/sections/${reordered[i].id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: i }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal mengubah urutan.");
        }
      }

      await loadSections();
      setNotice("Urutan section berhasil diperbarui.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengubah urutan."
      );
      await loadSections();
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(key: string, value: string | number) {
    setInspectorSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={26} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Visual Store Editor
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Atur elemen, susunan, dan konfigurasi halaman tokomu.
          </p>
        </div>

        <button
          onClick={loadSections}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="mb-2 block text-xs font-bold text-slate-700">
          Pilih halaman
        </label>

        <select
          value={selectedPageId}
          onChange={(event) => setSelectedPageId(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
        >
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.title} — {page.path}
            </option>
          ))}
        </select>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-600" />
            <h4 className="font-bold text-slate-900">
              Section Library
            </h4>
          </div>

          <div className="space-y-2">
            {sectionLibrary.map((item) => (
              <button
                key={item.type}
                onClick={() => addSection(item.type, item.name)}
                disabled={!selectedPageId || saving}
                className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {item.name}
                  </span>

                  {addingType === item.type ? (
                    <Loader2 size={15} className="animate-spin text-blue-600" />
                  ) : (
                    <Plus size={15} className="text-blue-600" />
                  )}
                </div>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <Layers3 size={18} className="text-blue-600" />
            <h4 className="font-bold text-slate-900">Layers</h4>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
              {sections.length}
            </span>
          </div>

          {sections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
              <LayoutTemplate size={27} className="mx-auto text-slate-300" />
              <p className="mt-3 text-xs font-semibold text-slate-600">
                Belum ada section
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                Pilih elemen dari Section Library.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((section, index) => {
                const selected = section.id === selectedSectionId;

                return (
                  <div
                    key={section.id}
                    className={`flex items-center gap-1 rounded-xl border p-2 ${
                      selected
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedSectionId(section.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 p-1 text-left"
                    >
                      <Layers3 size={16} className="shrink-0 text-blue-600" />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-slate-800">
                          {section.name}
                        </span>
                        <span className="mt-1 block text-[9px] text-slate-400">
                          {section.type}
                        </span>
                      </span>
                    </button>

                    <div className="flex shrink-0 items-center">
                      <button
                        onClick={() => moveSection(index, -1)}
                        disabled={saving || index === 0}
                        title="Pindah ke atas"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowUp size={14} />
                      </button>

                      <button
                        onClick={() => moveSection(index, 1)}
                        disabled={saving || index === sections.length - 1}
                        title="Pindah ke bawah"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        onClick={() => deleteSection(section.id)}
                        disabled={saving}
                        title="Hapus section"
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <Settings2 size={18} className="text-blue-600" />
            <h4 className="font-bold text-slate-900">Inspector</h4>
          </div>

          {!selectedSection ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
              <Settings2 size={26} className="mx-auto text-slate-300" />
              <p className="mt-3 text-xs font-semibold text-slate-600">
                Pilih section terlebih dahulu
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                Pengaturan section akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-slate-600">
                  Nama section
                </label>
                <input
                  value={inspectorName}
                  onChange={(event) => setInspectorName(event.target.value)}
                  maxLength={80}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                />
              </div>

              {(fieldsByType[selectedSection.type] || commonFields).map((field) => (
                <div key={field.key}>
                  <label className="mb-2 block text-[11px] font-semibold text-slate-600">
                    {field.label}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={String(inspectorSettings[field.key] ?? "")}
                      onChange={(event) =>
                        updateSetting(field.key, event.target.value)
                      }
                      placeholder={field.placeholder}
                      className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  ) : field.type === "color" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={String(inspectorSettings[field.key] || "#ffffff")}
                        onChange={(event) =>
                          updateSetting(field.key, event.target.value)
                        }
                        className="h-10 w-12 rounded-lg border border-slate-200 bg-white p-1"
                      />
                      <input
                        value={String(inspectorSettings[field.key] ?? "")}
                        onChange={(event) =>
                          updateSetting(field.key, event.target.value)
                        }
                        placeholder="#ffffff"
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <input
                      type={field.type || "text"}
                      min={field.type === "number" ? 1 : undefined}
                      max={field.type === "number" ? 24 : undefined}
                      value={String(inspectorSettings[field.key] ?? "")}
                      onChange={(event) =>
                        updateSetting(
                          field.key,
                          field.type === "number"
                            ? Number(event.target.value)
                            : event.target.value
                        )
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  {inspectorVisible ? (
                    <Eye size={16} className="text-slate-600" />
                  ) : (
                    <EyeOff size={16} className="text-slate-400" />
                  )}
                  <span className="text-xs font-semibold text-slate-700">
                    Tampilkan section
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectorVisible((value) => !value)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                    inspectorVisible
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {inspectorVisible ? "Aktif" : "Nonaktif"}
                </button>
              </div>

              <button
                onClick={saveInspector}
                disabled={saving || !inspectorName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                Simpan pengaturan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CANVAS_PREVIEW_START */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="flex items-center gap-2">
              <Eye size={17} className="text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Canvas Preview
              </h4>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Perubahan Inspector tampil langsung di sini.
            </p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1.5 text-[10px] font-bold text-blue-700">
            LIVE PREVIEW
          </span>
        </div>

        <div className="bg-slate-100 p-3 sm:p-6">
          <div className="mx-auto min-h-[350px] max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {sections.filter((section) => section.isVisible).length === 0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
                <LayoutTemplate size={38} className="text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-600">
                  Canvas masih kosong
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Tambahkan section melalui Section Library.
                </p>
              </div>
            ) : (
              sections
                .filter((section) => section.isVisible)
                .map((section) => {
                  const settings =
                    section.id === selectedSectionId
                      ? inspectorSettings
                      : parseSettings(section.settings);

                  const heading =
                    String(settings.heading || section.name);

                  const description =
                    String(
                      settings.description ||
                      "Deskripsi section akan ditampilkan di sini."
                    );

                  const backgroundColor =
                    String(settings.backgroundColor || "#ffffff");

                  const textColor =
                    String(settings.textColor || "#1e293b");

                  const imageUrl = String(settings.imageUrl || "");

                  const validImage =
                    /^https?:\/\/\S+$/i.test(imageUrl);

                  const columns = Math.min(
                    4,
                    Math.max(1, Number(settings.columns) || 3)
                  );

                  const isSelected =
                    section.id === selectedSectionId;

                  const button = (
                    <span className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white">
                      {String(settings.buttonText || "Belanja sekarang")}
                    </span>
                  );

                  return (
                    <div
                      key={section.id}
                      onClick={() => setSelectedSectionId(section.id)}
                      className={`relative cursor-pointer border-b border-slate-100 transition ${
                        isSelected
                          ? "z-[1] ring-2 ring-inset ring-blue-500"
                          : "hover:ring-1 hover:ring-inset hover:ring-blue-300"
                      }`}
                      style={{
                        backgroundColor,
                        color: textColor,
                      }}
                    >
                      {isSelected && (
                        <span className="absolute right-2 top-2 z-10 rounded-md bg-blue-600 px-2 py-1 text-[9px] font-bold text-white">
                          SELECTED
                        </span>
                      )}

                      {section.type === "HEADER" && (
                        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                          <strong className="text-base">
                            {String(settings.logoText || heading)}
                          </strong>
                          <span className="text-xs opacity-70">
                            {String(settings.menuText || "Home   Shop   About")}
                          </span>
                        </div>
                      )}

                      {section.type === "HERO" && (
                        <div className="grid min-h-[230px] items-center gap-6 p-7 sm:grid-cols-2 sm:p-12">
                          <div>
                            <p className="mb-2 text-xs opacity-60">
                              {String(settings.subheading || "")}
                            </p>
                            <h2 className="text-3xl font-extrabold leading-tight">
                              {heading}
                            </h2>
                            <p className="mt-3 text-sm leading-6 opacity-75">
                              {description}
                            </p>
                            <div className="mt-5">{button}</div>
                          </div>
                          <div className="flex min-h-[160px] items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                            {validImage ? (
                              <img
                                src={imageUrl}
                                alt={heading}
                                className="h-full max-h-64 w-full object-cover"
                              />
                            ) : (
                              <div className="text-center text-slate-400">
                                <LayoutTemplate size={38} className="mx-auto" />
                                <p className="mt-2 text-[10px]">
                                  Area gambar Hero
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {section.type === "RICH_TEXT" && (
                        <div className="px-6 py-12 text-center">
                          <h2 className="text-2xl font-bold">{heading}</h2>
                          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 opacity-75">
                            {description}
                          </p>
                        </div>
                      )}

                      {section.type === "IMAGE" && (
                        <div className="p-6 text-center">
                          {validImage ? (
                            <img
                              src={imageUrl}
                              alt={String(settings.alt || heading)}
                              className="mx-auto max-h-80 w-full rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100">
                              <LayoutTemplate size={36} className="text-slate-400" />
                            </div>
                          )}
                          {settings.caption && (
                            <p className="mt-3 text-xs opacity-70">
                              {String(settings.caption)}
                            </p>
                          )}
                        </div>
                      )}

                      {section.type === "IMAGE_GALLERY" && (
                        <div className="p-6">
                          <h2 className="mb-5 text-center text-xl font-bold">
                            {heading}
                          </h2>
                          <div
                            className="grid gap-3"
                            style={{
                              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                            }}
                          >
                            {String(settings.imageUrls || "")
                              .split("\n")
                              .map((url) => url.trim())
                              .filter((url) => /^https?:\/\/\S+$/i.test(url))
                              .slice(0, 8)
                              .map((url, index) => (
                                <img
                                  key={`${url}-${index}`}
                                  src={url}
                                  alt={`Gallery ${index + 1}`}
                                  className="h-24 w-full rounded-lg object-cover sm:h-36"
                                />
                              ))}
                          </div>
                          <p className="mt-3 text-center text-xs opacity-60">
                            {description}
                          </p>
                        </div>
                      )}

                      {section.type === "PRODUCT_GRID" && (
                        <div className="p-6">
                          <h2 className="text-center text-xl font-bold">
                            {heading}
                          </h2>
                          <p className="mb-5 mt-2 text-center text-xs opacity-60">
                            {description}
                          </p>
                          <div
                            className="grid gap-3"
                            style={{
                              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                            }}
                          >
                            {Array.from({
                              length: Math.min(
                                8,
                                Math.max(
                                  1,
                                  Number(settings.productLimit) || 4
                                )
                              ),
                            }).map((_, index) => (
                              <div
                                key={index}
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800"
                              >
                                <div className="flex h-20 items-center justify-center bg-slate-100 sm:h-28">
                                  <LayoutTemplate size={25} className="text-slate-300" />
                                </div>
                                <div className="p-2">
                                  <p className="text-[10px] font-bold">
                                    Contoh Produk {index + 1}
                                  </p>
                                  <p className="mt-1 text-[10px] text-slate-500">
                                    Rp 100.000
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "FEATURED_PRODUCT" && (
                        <div className="grid items-center gap-5 p-6 sm:grid-cols-2">
                          <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100">
                            <LayoutTemplate size={36} className="text-slate-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">{heading}</h2>
                            <p className="my-3 text-sm opacity-70">
                              {description}
                            </p>
                            {button}
                          </div>
                        </div>
                      )}

                      {section.type === "CATEGORIES" && (
                        <div className="p-6">
                          <h2 className="mb-5 text-center text-xl font-bold">
                            {heading}
                          </h2>
                          <div
                            className="grid gap-3"
                            style={{
                              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                            }}
                          >
                            {["Fashion", "Accessories", "New Arrivals", "Popular"]
                              .slice(0, columns + 1)
                              .map((item) => (
                                <div
                                  key={item}
                                  className="rounded-xl bg-slate-100 p-5 text-center text-xs font-bold text-slate-700"
                                >
                                  {item}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {section.type === "PROMO_BANNER" && (
                        <div className="p-8 text-center">
                          <h2 className="text-2xl font-extrabold">{heading}</h2>
                          <p className="my-3 text-sm opacity-75">
                            {description}
                          </p>
                          {button}
                        </div>
                      )}

                      {section.type === "TESTIMONIALS" && (
                        <div className="p-6">
                          <h2 className="mb-5 text-center text-xl font-bold">
                            {heading}
                          </h2>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {String(settings.items || "")
                              .split("\n")
                              .filter(Boolean)
                              .slice(0, 4)
                              .map((item, index) => (
                                <div
                                  key={index}
                                  className="rounded-xl border border-slate-200 p-4"
                                >
                                  <p className="text-xs leading-6">
                                    “{item}”
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {section.type === "FAQ" && (
                        <div className="mx-auto max-w-2xl space-y-3 p-6">
                          <h2 className="mb-5 text-center text-xl font-bold">
                            {heading}
                          </h2>
                          {String(settings.items || "")
                            .split("\n")
                            .filter(Boolean)
                            .slice(0, 8)
                            .map((item, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-slate-200 p-4 text-xs"
                              >
                                {item}
                              </div>
                            ))}
                        </div>
                      )}

                      {section.type === "FOOTER" && (
                        <div className="p-8 text-center">
                          <h2 className="text-lg font-bold">{heading}</h2>
                          <p className="mx-auto my-3 max-w-lg text-xs opacity-70">
                            {description}
                          </p>
                          <p className="text-[10px] opacity-60">
                            {String(settings.copyright || "© 2026 Nama Toko")}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
          <p className="mt-3 text-center text-[10px] text-slate-500">
            Preview ini menggunakan contoh produk. Tampilan publik dan data produk
            asli akan dihubungkan pada tahap berikutnya.
          </p>
        </div>
      </div>
      {/* CANVAS_PREVIEW_END */}

      {saving && (
        <div className="flex items-center gap-2 text-[11px] text-blue-600">
          <Loader2 size={13} className="animate-spin" />
          Menyimpan perubahan...
        </div>
      )}
    </div>
  );
}
