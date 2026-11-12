import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090b] px-6 py-16 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[3px] text-blue-400">
          ORDERLY — BETA
        </p>

        <h1 className="mt-5 text-3xl font-extrabold">
          Pendaftaran belum dibuka
        </h1>

        <p className="mt-4 text-sm leading-7 text-white/60">
          ORDERLY masih dalam tahap pengembangan dan pengujian.
          Pembuatan akun merchant untuk umum saat ini belum tersedia.
        </p>

        <div className="mt-7 rounded-2xl border border-blue-400/20 bg-blue-400/[0.06] p-5 text-left text-sm leading-7 text-white/70">
          Untuk informasi mengenai akses beta dan perkembangan ORDERLY,
          silakan hubungi tim H3 Works Creative melalui kanal resmi.
        </div>

        <a
          href="https://wa.me/628571566568?text=Halo%20H3%20Works%2C%20saya%20ingin%20bertanya%20tentang%20akses%20beta%20ORDERLY."
          target="_blank"
          rel="noreferrer"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-blue-500"
        >
          <MessageCircle size={17} />
          Hubungi H3 Works
        </a>

        <a
          href="mailto:creativehworks@gmail.com"
          className="mt-4 block text-sm text-white/60 transition hover:text-white"
        >
          creativehworks@gmail.com
        </a>

        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Kembali ke halaman login
        </Link>
      </section>
    </main>
  );
}
