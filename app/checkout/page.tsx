import Link from "next/link";
import { ArrowLeft, MessageCircle, Construction } from "lucide-react";

export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B14] px-6 py-16 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#101522] p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-blue-400">
          <Construction size={26} />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[3px] text-blue-400">
          ORDERLY — BETA
        </p>

        <h1 className="mt-5 text-3xl font-extrabold">
          Checkout belum tersedia.
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          ORDERLY masih dalam tahap pengembangan dan pengujian.
          Pendaftaran publik, pemesanan, pembayaran online, dan aktivasi
          langganan otomatis belum tersedia.
        </p>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left text-sm leading-7 text-slate-400">
          Untuk pertanyaan mengenai pengembangan ORDERLY atau kemungkinan
          kerja sama, silakan hubungi tim H3 Works Creative.
        </div>

        <a
          href="https://wa.me/628571566568?text=Halo%20H3%20Works%2C%20saya%20ingin%20bertanya%20tentang%20ORDERLY."
          target="_blank"
          rel="noreferrer"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-blue-500"
        >
          <MessageCircle size={17} />
          Hubungi H3 Works
        </a>

        <a
          href="mailto:creativehworks@gmail.com"
          className="mt-4 block text-sm text-slate-400 transition hover:text-white"
        >
          creativehworks@gmail.com
        </a>

        <Link
          href="/products/orderly"
          className="mt-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Kembali ke informasi ORDERLY
        </Link>
      </section>
    </main>
  );
}
