import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  MessagesSquare,
  Globe,
  ShoppingBag,
  Workflow,
  Code2,
  Lightbulb,
  FlaskConical,
} from "lucide-react";

const developmentAreas = [
  {
    number: "01",
    title: "Telegram Bot",
    description:
      "Eksplorasi pengelolaan pesanan dan interaksi toko melalui bot Telegram.",
    icon: Bot,
    status: "In Development",
  },
  {
    number: "02",
    title: "WhatsApp Integration",
    description:
      "Pengembangan konsep integrasi komunikasi dan alur pesanan melalui WhatsApp.",
    icon: MessagesSquare,
    status: "In Development",
  },
  {
    number: "03",
    title: "Discord Integration",
    description:
      "Eksplorasi integrasi bot dan pengelolaan aktivitas melalui ekosistem Discord.",
    icon: Workflow,
    status: "In Development",
  },
  {
    number: "04",
    title: "Website Store",
    description:
      "Pengembangan konsep etalase digital untuk menampilkan produk dan layanan.",
    icon: Globe,
    status: "In Development",
  },
  {
    number: "05",
    title: "Marketplace Automation",
    description:
      "Riset dan pengembangan konsep otomatisasi operasional marketplace.",
    icon: ShoppingBag,
    status: "Exploration",
  },
  {
    number: "06",
    title: "Unified Management",
    description:
      "Eksplorasi pendekatan pengelolaan berbagai kebutuhan operasional dalam satu sistem.",
    icon: Code2,
    status: "Exploration",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080d1b] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Kembali ke halaman utama
        </Link>

        <section className="relative py-20 text-center sm:py-28">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

          <div className="relative">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-bold tracking-wider text-blue-300">
              <FlaskConical size={14} />
              PRODUCT DEVELOPMENT — BETA
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[4px] text-blue-400">
              A PRODUCT BY H3 WORKS
            </p>

            <h1 className="mt-5 text-5xl font-extrabold tracking-tight sm:text-7xl">
              Building
              <span className="block text-blue-400">ORDERLY.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              ORDERLY merupakan produk digital yang sedang dikembangkan
              oleh H3 Works. Kami mengeksplorasi cara baru untuk membantu
              bisnis mengelola pesanan dan aktivitas operasional melalui
              teknologi yang terintegrasi.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products/orderly"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold transition hover:bg-blue-500"
              >
                Tentang ORDERLY
                <ArrowUpRight size={16} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
              >
                Hubungi H3 Works
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-16 sm:py-20">
          <div className="mb-9">
            <p className="text-xs font-bold uppercase tracking-[2px] text-blue-400">
              01 — DEVELOPMENT AREAS
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              What we are exploring.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
              Beberapa area yang menjadi fokus eksplorasi dan pengembangan
              ORDERLY. Cakupan dan prioritas fitur dapat berubah selama
              proses pengembangan.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {developmentAreas.map((area) => {
              const Icon = area.icon;

              return (
                <article
                  key={area.number}
                  className="rounded-2xl border border-white/10 bg-[#101727] p-6 transition hover:border-blue-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                      <Icon size={21} />
                    </div>
                    <span className="text-xs font-semibold tracking-wider text-slate-600">
                      {area.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold">{area.title}</h3>

                  <p className="mt-3 min-h-16 text-xs leading-6 text-slate-400">
                    {area.description}
                  </p>

                  <div className="mt-6 border-t border-white/10 pt-4">
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      {area.status}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-16 sm:grid-cols-2 sm:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[2px] text-blue-400">
              02 — OUR APPROACH
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Built through exploration.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Kami percaya produk digital yang baik dibangun melalui
              proses yang terarah: memahami kebutuhan, mengeksplorasi
              solusi, menguji pendekatan, dan terus menyempurnakan
              pengalaman.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#101727] p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
              <Lightbulb size={21} />
            </div>
            <h3 className="mt-5 text-lg font-bold">
              Still evolving. Always improving.
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              ORDERLY masih berada dalam tahap pengembangan dan pengujian.
              Fitur, integrasi, dan arah produk dapat berkembang seiring
              proses tersebut.
            </p>
          </div>
        </section>

        <section className="border-t border-white/10 py-16 sm:py-20">
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/[0.05] p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[2px] text-blue-400">
              03 — DEVELOPMENT STATUS
            </p>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              ORDERLY is currently in beta development.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              ORDERLY belum dibuka untuk pendaftaran publik. Layanan
              berlangganan, checkout, pembayaran online, dan aktivasi
              otomatis belum tersedia untuk penggunaan produksi.
              Halaman ini merupakan informasi mengenai arah pengembangan
              produk, bukan penawaran atau permintaan pembayaran.
            </p>

            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-300 transition hover:text-white"
            >
              Discuss with H3 Works
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} H3 Works Creative.
          </p>

          <div className="flex flex-wrap gap-5">
            <Link href="/products" className="transition hover:text-white">
              Products
            </Link>
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
