"use client";

import { useEffect, useState } from "react";
import {
  Store,
  Contact,
  Palette,
  Settings,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  PlugZap,
  RefreshCw,
  Wallet,
  Unplug,
} from "lucide-react";

interface StoreSettings {
  storeName: string;
  slug: string;
  description: string;
  logoUrl: string;
  ownerName: string;
  email: string;
  whatsapp: string;
  address: string;
  primaryColor: string;
  welcomeMessage: string;
  footerText: string;
  storeStatus: "Buka" | "Tutup";
  currency: string;
  timezone: string;
  notifications: boolean;
}

const defaults: StoreSettings = {
  storeName: "Toko Genta",
  slug: "tokogenta",
  description: "Selamat datang di toko kami. Temukan produk digital favoritmu.",
  logoUrl: "",
  ownerName: "Genta J. Dilaga",
  email: "",
  whatsapp: "",
  address: "",
  primaryColor: "#2563eb",
  welcomeMessage: "Halo! Selamat datang di toko kami.",
  footerText: "Terima kasih sudah berbelanja di toko kami.",
  storeStatus: "Buka",
  currency: "IDR",
  timezone: "Asia/Jakarta",
  notifications: true,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50";

const labelClass = "mb-2 block text-xs font-semibold text-slate-600";

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(defaults);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [digiflazzUsername, setDigiflazzUsername] = useState("");
  const [digiflazzApiKey, setDigiflazzApiKey] = useState("");
  const [digiflazzConnected, setDigiflazzConnected] = useState(false);
  const [digiflazzBalance, setDigiflazzBalance] = useState<number | null>(null);
  const [digiflazzLoading, setDigiflazzLoading] = useState(false);
  const [digiflazzMessage, setDigiflazzMessage] = useState("");
  const [digiflazzError, setDigiflazzError] = useState("");

  useEffect(() => {
    try {
      const data = localStorage.getItem("orderly_store_settings");
      if (data) {
        setSettings({ ...defaults, ...JSON.parse(data) });
      }
    } catch {
      console.error("Gagal membaca pengaturan toko.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    async function loadDigiflazz() {
      try {
        const response = await fetch("/api/digiflazz", {
          cache: "no-store",
        });
        const data = await response.json();

        if (response.ok) {
          setDigiflazzConnected(Boolean(data.connected));
          setDigiflazzUsername(data.username || "");
          setDigiflazzBalance(
            typeof data.balance === "number" ? data.balance : null
          );
        }
      } catch {
        setDigiflazzError("Tidak dapat memuat status Digiflazz.");
      }
    }

    loadDigiflazz();
  }, []);

  async function connectDigiflazz() {
    if (!digiflazzUsername.trim() || !digiflazzApiKey.trim()) {
      setDigiflazzError("Username dan API Key wajib diisi.");
      return;
    }

    setDigiflazzLoading(true);
    setDigiflazzError("");
    setDigiflazzMessage("");

    try {
      const response = await fetch("/api/digiflazz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: digiflazzUsername.trim(),
          apiKey: digiflazzApiKey.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghubungkan Digiflazz.");
      }

      setDigiflazzConnected(true);
      setDigiflazzApiKey("");
      setDigiflazzBalance(
        typeof data.balance === "number" ? data.balance : null
      );
      setDigiflazzMessage(data.message || "Digiflazz berhasil terhubung.");
    } catch (err) {
      setDigiflazzError(
        err instanceof Error ? err.message : "Gagal menghubungkan Digiflazz."
      );
    } finally {
      setDigiflazzLoading(false);
    }
  }

  async function disconnectDigiflazz() {
    if (!window.confirm("Putuskan koneksi Digiflazz dari ORDERLY?")) return;

    setDigiflazzLoading(true);
    setDigiflazzError("");
    setDigiflazzMessage("");

    try {
      const response = await fetch("/api/digiflazz", {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memutuskan koneksi.");
      }

      setDigiflazzConnected(false);
      setDigiflazzUsername("");
      setDigiflazzApiKey("");
      setDigiflazzBalance(null);
      setDigiflazzMessage("Koneksi Digiflazz berhasil diputuskan.");
    } catch (err) {
      setDigiflazzError(
        err instanceof Error ? err.message : "Gagal memutuskan koneksi."
      );
    } finally {
      setDigiflazzLoading(false);
    }
  }

  function update<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem("orderly_store_settings", JSON.stringify(settings));
    setSaved(true);
  }

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Kelola identitas dan konfigurasi tokomu.
          </p>
          <h2 className="mt-1 font-[Plus_Jakarta_Sans] text-2xl font-extrabold tracking-tight text-slate-900">
            Store Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Atur bagaimana tokomu ditampilkan dan beroperasi.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Save size={15} />
          Simpan perubahan
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
          <CheckCircle2 size={16} />
          Pengaturan toko berhasil disimpan.
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Store size={19} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Informasi Toko
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Informasi dasar dan identitas tokomu.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Nama toko</label>
                <input
                  className={inputClass}
                  value={settings.storeName}
                  onChange={(e) => update("storeName", e.target.value)}
                  placeholder="Nama toko"
                />
              </div>

              <div>
                <label className={labelClass}>Username / Slug toko</label>
                <div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-blue-400">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-xs text-slate-400">
                    orderly.id/
                  </span>
                  <input
                    className="min-w-0 flex-1 px-3 py-3 text-sm text-slate-700 outline-none"
                    value={settings.slug}
                    onChange={(e) =>
                      update(
                        "slug",
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="username-toko"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Deskripsi toko</label>
                <textarea
                  className={inputClass + " min-h-[100px] resize-y"}
                  value={settings.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Ceritakan tentang tokomu..."
                />
              </div>

              <div>
                <label className={labelClass}>URL Logo Toko</label>
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Logo toko"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={20} />
                    )}
                  </div>
                  <input
                    className={inputClass}
                    value={settings.logoUrl}
                    onChange={(e) => update("logoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-400">
                  Masukkan URL gambar logo toko.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Contact size={19} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Informasi Kontak
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Informasi pemilik dan kontak pelanggan.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Nama pemilik</label>
                <input
                  className={inputClass}
                  value={settings.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                  placeholder="Nama pemilik"
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={settings.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="email@contoh.com"
                />
              </div>

              <div>
                <label className={labelClass}>Nomor WhatsApp</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={settings.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className={labelClass}>Alamat toko</label>
                <input
                  className={inputClass}
                  value={settings.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Alamat (opsional)"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Palette size={19} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tampilan Toko
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Sesuaikan tampilan dan pesan tokomu.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Warna utama brand</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => update("primaryColor", e.target.value)}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />
                  <span className="text-xs font-semibold text-slate-600">
                    {settings.primaryColor.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Pesan sambutan</label>
                <textarea
                  className={inputClass + " min-h-[80px] resize-y"}
                  value={settings.welcomeMessage}
                  onChange={(e) => update("welcomeMessage", e.target.value)}
                  placeholder="Pesan sambutan untuk pelanggan..."
                />
              </div>

              <div>
                <label className={labelClass}>Teks footer</label>
                <input
                  className={inputClass}
                  value={settings.footerText}
                  onChange={(e) => update("footerText", e.target.value)}
                  placeholder="Teks penutup toko"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <PlugZap size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Integrasi Digiflazz
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Hubungkan akun supplier produk digitalmu.
                  </p>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                digiflazzConnected
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {digiflazzConnected ? "Terhubung" : "Belum terhubung"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                <div className="flex items-start gap-2">
                  <Info size={15} className="mt-0.5 shrink-0 text-indigo-600" />
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Gunakan kredensial API dari akun Digiflazz milik tokomu.
                    Satu koneksi akan digunakan bersama oleh bot Telegram,
                    WhatsApp, dan Discord.
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Username Digiflazz</label>
                <input
                  className={inputClass}
                  value={digiflazzUsername}
                  onChange={(e) => setDigiflazzUsername(e.target.value)}
                  placeholder="Username akun Digiflazz"
                  autoComplete="username"
                  disabled={digiflazzLoading}
                />
              </div>

              <div>
                <label className={labelClass}>API Key</label>
                <input
                  type="password"
                  className={inputClass}
                  value={digiflazzApiKey}
                  onChange={(e) => setDigiflazzApiKey(e.target.value)}
                  placeholder={digiflazzConnected
                    ? "Masukkan API Key baru jika ingin mengganti"
                    : "Masukkan API Key Digiflazz"}
                  autoComplete="new-password"
                  disabled={digiflazzLoading}
                />
                <p className="mt-2 text-[10px] text-slate-400">
                  API Key dienkripsi di server dan tidak ditampilkan kembali.
                </p>
              </div>

              {digiflazzConnected && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-[10px] font-semibold text-slate-400">
                      Akun terhubung
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {digiflazzUsername || "Digiflazz"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Wallet size={13} />
                      <p className="text-[10px] font-semibold">Saldo supplier</p>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {digiflazzBalance !== null
                        ? new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(digiflazzBalance)
                        : "Belum tersedia"}
                    </p>
                  </div>
                </div>
              )}

              {digiflazzError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {digiflazzError}
                </div>
              )}

              {digiflazzMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                  {digiflazzMessage}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={connectDigiflazz}
                  disabled={digiflazzLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {digiflazzLoading ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <PlugZap size={15} />
                  )}
                  {digiflazzConnected ? "Simpan & tes koneksi" : "Hubungkan & tes koneksi"}
                </button>

                {digiflazzConnected && (
                  <button
                    type="button"
                    onClick={disconnectDigiflazz}
                    disabled={digiflazzLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Unplug size={15} />
                    Putuskan koneksi
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Settings size={19} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pengaturan Operasional
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Atur status dan preferensi operasional toko.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Status toko</label>
                <select
                  className={inputClass}
                  value={settings.storeStatus}
                  onChange={(e) =>
                    update("storeStatus", e.target.value as "Buka" | "Tutup")
                  }
                >
                  <option value="Buka">Buka — menerima pesanan</option>
                  <option value="Tutup">Tutup — tidak menerima pesanan</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Mata uang</label>
                <select
                  className={inputClass}
                  value={settings.currency}
                  onChange={(e) => update("currency", e.target.value)}
                >
                  <option value="IDR">IDR — Rupiah Indonesia</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Zona waktu</label>
                <select
                  className={inputClass}
                  value={settings.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                >
                  <option value="Asia/Jakarta">WIB — Jakarta</option>
                  <option value="Asia/Makassar">WITA — Makassar</option>
                  <option value="Asia/Jayapura">WIT — Jayapura</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs font-bold text-slate-700">
                  Notifikasi pesanan
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Aktifkan preferensi notifikasi pesanan.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.notifications}
                onClick={() =>
                  update("notifications", !settings.notifications)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  settings.notifications ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                    settings.notifications ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </section>

          <div className="flex flex-col justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2">
              <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
              <p className="text-[11px] leading-relaxed text-slate-600">
                Pengaturan saat ini disimpan di browser perangkat ini.
                Belum tersinkronisasi dengan database atau bot Telegram.
              </p>
            </div>
            <button
              onClick={handleSave}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              Simpan pengaturan
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Preview Toko</h3>
          <p className="mt-1 text-xs text-slate-400">
            Pratinjau identitas toko.
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <div
              className="flex h-24 items-center justify-center"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/50 bg-white text-xl font-extrabold text-slate-700">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  settings.storeName.slice(0, 1).toUpperCase() || "T"
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-extrabold text-slate-900">
                  {settings.storeName || "Nama Toko"}
                </h4>
                <span
                  className={`rounded-md px-2 py-1 text-[9px] font-bold ${
                    settings.storeStatus === "Buka"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {settings.storeStatus}
                </span>
              </div>

              <p className="mt-1 text-[10px] text-slate-400">
                @{settings.slug || "username"}
              </p>

              <p className="mt-4 text-xs leading-relaxed text-slate-600">
                {settings.description || "Deskripsi toko akan muncul di sini."}
              </p>

              <div
                className="mt-5 rounded-lg px-3 py-2.5 text-center text-[10px] font-bold text-white"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Lihat Katalog
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold text-slate-700">
              Pesan sambutan
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {settings.welcomeMessage || "Belum ada pesan sambutan."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
