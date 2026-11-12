import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B14] px-5 py-16 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101522] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
          <Construction size={32} />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[3px] text-blue-400">
          ORDERLY · BETA
        </p>

        <h1 className="mt-3 text-3xl font-extrabold">
          Fitur pembayaran belum tersedia.
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          ORDERLY masih dalam tahap pengembangan. Belum ada transaksi,
          pembayaran, atau aktivasi langganan yang dapat dilakukan melalui
          website ini.
        </p>

        <Link
          href="/products/orderly"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold transition hover:bg-blue-500"
        >
          <ArrowLeft size={17} />
          Kembali ke ORDERLY
        </Link>

        <Link
          href="/"
          className="mt-5 inline-flex text-xs text-slate-500 transition hover:text-white"
        >
          Kembali ke H3 Works
        </Link>
      </div>
    </main>
  );
}
