import Link from "next/link";
import {
  ArrowLeft,
  Construction,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export default function PaymentPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B14] px-4 py-16 text-white">
      <div className="w-full max-w-xl">
        <Link
          href="/products/orderly"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Kembali ke ORDERLY
        </Link>

        <section className="mt-12 rounded-2xl border border-white/10 bg-[#101522] p-7 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
            <Construction size={26} className="text-blue-400" />
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[3px] text-blue-400">
            ORDERLY · BETA
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pembayaran belum tersedia.
          </h1>

          <p className="mt-5 text-sm leading-7 text-slate-400">
            ORDERLY masih berada dalam tahap pengembangan. Sistem langganan,
            checkout, integrasi penyedia pembayaran, dan aktivasi otomatis
            belum tersedia untuk penggunaan publik.
          </p>

          <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
              <ShieldCheck size={17} />
              Informasi penting
            </div>
            <p className="mt-2 text-xs leading-6 text-amber-100/70">
              Halaman ini hanya memberikan informasi status pengembangan.
              Tidak ada tagihan atau transaksi pembayaran yang dapat dilakukan
              melalui website ini.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products/orderly"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold transition hover:bg-blue-500"
            >
              Pelajari ORDERLY
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              <MessageCircle size={16} />
              Hubungi H3 Works
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-600">
          A product by H3 Works Creative
        </p>
      </div>
    </main>
  );
}
