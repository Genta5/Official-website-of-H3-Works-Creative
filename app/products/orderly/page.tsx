import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  MessageSquare,
  Globe,
  Package,
  ShieldCheck,
  Asterisk,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    number: "01",
    title: "Telegram Bot",
    status: "In Development",
    description:
      "Eksplorasi pengelolaan pesanan dan interaksi pelanggan melalui bot Telegram.",
  },
  {
    icon: MessageSquare,
    number: "02",
    title: "WhatsApp Integration",
    status: "In Development",
    description:
      "Pengembangan konsep integrasi komunikasi dan informasi pesanan melalui WhatsApp.",
  },
  {
    icon: Globe,
    number: "03",
    title: "Website Store",
    status: "In Development",
    description:
      "Eksplorasi halaman toko digital untuk menampilkan produk dan informasi penjualan.",
  },
  {
    icon: Package,
    number: "04",
    title: "Order Management",
    status: "In Development",
    description:
      "Perancangan sistem untuk membantu pengelolaan produk, pesanan, dan status transaksi.",
  },
];

export default function OrderlyPage() {
  return (
    <main className="min-h-screen bg-[#f1eee6] text-[#20201c]">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-7 sm:px-8 lg:px-14">
        <Link href="/" className="text-lg font-black tracking-tight">
          H3 WORKS<span className="text-[#f15a38]">.</span>
        </Link>

        <Link
          href="/products"
          className="text-sm font-semibold text-black/45 transition-colors hover:text-[#f15a38]"
        >
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Products
        </Link>
      </nav>

      <section className="mx-auto max-w-[1440px] px-5 pb-28 pt-16 sm:px-8 sm:pt-24 lg:px-14">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#f15a38]/30 bg-[#f15a38]/10 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-[#f15a38]">
            BETA DEVELOPMENT
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-black/35">
            A PRODUCT BY H3 WORKS
          </span>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/35">
              <Asterisk size={16} />
              Product / 001
            </div>

            <h1 className="text-6xl font-black leading-[0.85] tracking-[-0.085em] sm:text-8xl lg:text-[116px]">
              ORDERLY<span className="text-[#f15a38]">.</span>
            </h1>
          </div>

          <div className="border-l-2 border-[#f15a38] pl-6 lg:mb-2">
            <p className="max-w-xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              A simpler way to manage digital orders.
            </p>
            <p className="mt-5 max-w-xl text-sm leading-8 text-black/55 sm:text-base">
              ORDERLY merupakan produk SaaS yang sedang dikembangkan oleh
              H3 Works untuk mengeksplorasi pengelolaan pesanan digital,
              integrasi kanal penjualan, dan alur operasional bisnis dalam
              satu platform.
            </p>
          </div>
        </div>

        <div className="mt-24 border-t border-black/15 pt-8">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-8 bg-[#f15a38]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f15a38]">
              Development Areas
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, number, title, status, description }) => (
              <article
                key={title}
                className="group rounded-sm border border-black/10 bg-[#e7e2d7] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#f15a38]/50 sm:p-9"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-black/30">
                      {number}
                    </span>
                    <Icon
                      className="h-7 w-7 text-[#f15a38]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="rounded-full border border-black/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-black/45">
                    {status}
                  </span>
                </div>

                <h2 className="mt-10 text-xl font-black tracking-tight sm:text-2xl">
                  {title}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-black/50">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <section className="mt-20 border border-black/10 bg-[#20201c] p-7 text-[#f1eee6] sm:p-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-[#f15a38]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f15a38]">
              Important Information
            </span>
          </div>

          <h2 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">
            Beta Development Notice
          </h2>

          <p className="mt-5 max-w-4xl text-sm leading-8 text-white/55">
            ORDERLY masih berada dalam tahap pengembangan dan pengujian.
            Seluruh area yang ditampilkan merupakan bagian dari rencana
            pengembangan dan belum tentu tersedia sebagai fitur aktif.
            Pendaftaran publik, paket langganan, checkout, integrasi
            payment gateway, pembayaran otomatis, dan aktivasi layanan
            otomatis belum tersedia. Halaman ini merupakan informasi
            produk, bukan penawaran pembelian atau permintaan pembayaran.
          </p>
        </section>

        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-black/15 pt-8">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#f15a38] transition-colors hover:text-black"
          >
            Contact H3 Works <ArrowUpRight size={17} />
          </Link>

          <Link
            href="/terms"
            className="text-sm font-medium text-black/40 transition-colors hover:text-[#f15a38]"
          >
            Terms of Service
          </Link>

          <Link
            href="/privacy"
            className="text-sm font-medium text-black/40 transition-colors hover:text-[#f15a38]"
          >
            Privacy Policy
          </Link>
        </div>
      </section>

      <footer className="bg-[#20201c] px-5 py-8 text-center text-xs text-white/40 sm:px-8">
        © {new Date().getFullYear()} H3 Works Creative.
      </footer>
    </main>
  );
}
