import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Layers3 } from "lucide-react";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          H3 WORKS<span className="text-blue-500">.</span>
        </Link>
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Kembali
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20">
        <p className="mb-6 text-xs font-bold uppercase tracking-[.3em] text-blue-400">
          Products / Digital Experiments
        </p>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Tools and ideas built for the digital world.
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/50">
          Kami mengeksplorasi dan mengembangkan produk digital untuk
          menghadirkan pendekatan baru dalam bekerja, mengelola proses,
          dan membangun pengalaman digital.
        </p>

        <article className="mt-20 overflow-hidden rounded-3xl border border-white/10 bg-[#10141d]">
          <div className="grid gap-12 p-8 md:grid-cols-2 md:p-14">
            <div className="flex flex-col items-start justify-between gap-12">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-[10px] font-bold tracking-widest text-blue-300">
                    BETA
                  </span>
                  <span className="text-xs tracking-widest text-white/40">
                    H3 WORKS PRODUCT / 001
                  </span>
                </div>

                <h2 className="mt-8 text-5xl font-extrabold tracking-tight">
                  ORDERLY<span className="text-blue-500">.</span>
                </h2>

                <p className="mt-5 text-xl text-white/70">
                  A simpler way to manage digital orders.
                </p>

                <p className="mt-6 leading-8 text-white/45">
                  ORDERLY adalah produk SaaS yang sedang dikembangkan
                  untuk mengeksplorasi pengelolaan pesanan dan integrasi
                  berbagai kanal digital dalam satu sistem.
                </p>
              </div>

              <Link
                href="/products/orderly"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                Explore ORDERLY <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-[#080d18]">
              <div className="text-center">
                <Layers3
                  className="mx-auto h-16 w-16 text-blue-400"
                  strokeWidth={1.2}
                />
                <p className="mt-6 text-3xl font-bold tracking-[.2em]">
                  ORDERLY
                </p>
                <p className="mt-2 text-xs tracking-[.3em] text-white/35">
                  ORDER MANAGEMENT SYSTEM
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-8 py-5 text-xs leading-6 text-white/40 md:px-14">
            ORDERLY masih berada dalam tahap pengembangan beta dan belum
            dibuka untuk penggunaan publik. Fitur, integrasi, pendaftaran,
            pembayaran, dan aktivasi langganan belum tersedia.
          </div>
        </article>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/35">
        © {new Date().getFullYear()} H3 Works Creative.
      </footer>
    </main>
  );
}
