import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  MessageSquare,
  Globe,
  Package,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Telegram Bot",
    status: "In Development",
    description:
      "Eksplorasi pengelolaan pesanan dan interaksi pelanggan melalui bot Telegram.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    status: "In Development",
    description:
      "Pengembangan konsep integrasi komunikasi dan informasi pesanan melalui WhatsApp.",
  },
  {
    icon: Globe,
    title: "Website Store",
    status: "In Development",
    description:
      "Eksplorasi halaman toko digital untuk menampilkan produk dan informasi penjualan.",
  },
  {
    icon: Package,
    title: "Order Management",
    status: "In Development",
    description:
      "Perancangan sistem untuk membantu pengelolaan produk, pesanan, dan status transaksi.",
  },
];

export default function OrderlyPage() {
  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          H3 WORKS<span className="text-blue-500">.</span>
        </Link>

        <Link href="/products" className="text-sm text-white/60 hover:text-white">
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Products
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-[10px] font-bold tracking-widest text-blue-300">
            BETA
          </span>
          <span className="text-xs tracking-widest text-white/35">
            A PRODUCT BY H3 WORKS
          </span>
        </div>

        <h1 className="mt-8 text-6xl font-extrabold tracking-tight md:text-8xl">
          ORDERLY<span className="text-blue-500">.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-2xl leading-relaxed text-white/65">
          A simpler way to manage digital orders.
        </p>

        <p className="mt-8 max-w-2xl text-base leading-8 text-white/45">
          ORDERLY merupakan produk SaaS yang sedang dikembangkan oleh
          H3 Works untuk mengeksplorasi pengelolaan pesanan digital,
          integrasi kanal penjualan, dan alur operasional bisnis dalam
          satu platform.
        </p>

        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-blue-500" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400">
              Development Areas
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, status, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[.025] p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <Icon className="h-7 w-7 text-blue-400" strokeWidth={1.5} />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-400/80">
                    {status}
                  </span>
                </div>

                <h2 className="mt-6 text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/45">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <section className="mt-16 rounded-2xl border border-blue-400/20 bg-blue-400/[.05] p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold">Beta Development Notice</h2>
          </div>

          <p className="mt-5 text-sm leading-7 text-white/55">
            ORDERLY masih berada dalam tahap pengembangan dan pengujian.
            Seluruh area yang ditampilkan merupakan bagian dari rencana
            pengembangan dan belum tentu tersedia sebagai fitur aktif.
            Pendaftaran publik, paket langganan, checkout, integrasi
            payment gateway, pembayaran otomatis, dan aktivasi layanan
            otomatis belum tersedia. Halaman ini merupakan informasi
            produk, bukan penawaran pembelian atau permintaan pembayaran.
          </p>
        </section>

        <div className="mt-14 flex flex-wrap gap-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            Contact H3 Works <ArrowUpRight size={17} />
          </Link>

          <Link href="/terms" className="text-sm text-white/45 hover:text-white">
            Terms of Service
          </Link>

          <Link href="/privacy" className="text-sm text-white/45 hover:text-white">
            Privacy Policy
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/35">
        © {new Date().getFullYear()} H3 Works Creative.
      </footer>
    </main>
  );
}
