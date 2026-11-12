import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Layers3,
  Code2,
  Palette,
  Workflow,
  MoveUpRight,
  Sparkles,
  Command,
} from "lucide-react";

const services = [
  {
    number: "01",
    icon: Palette,
    title: "Visual Communication",
    description:
      "Menerjemahkan ide dan identitas menjadi komunikasi visual yang memiliki karakter dan tujuan.",
    tags: ["Graphic Design", "Brand Identity", "Digital Content"],
  },
  {
    number: "02",
    icon: Code2,
    title: "Website Development",
    description:
      "Membangun pengalaman digital melalui website yang fungsional, responsif, dan terarah.",
    tags: ["Web Design", "Web Development", "Landing Page"],
  },
  {
    number: "03",
    icon: Workflow,
    title: "Digital Solutions",
    description:
      "Mengembangkan solusi digital untuk membantu bisnis mengelola proses dan aktivitasnya.",
    tags: ["Automation", "Digital Product", "SaaS"],
  },
];

const principles = [
  {
    number: "01",
    title: "Purpose before pixels.",
    description: "Setiap keputusan desain dan teknologi harus memiliki alasan.",
  },
  {
    number: "02",
    title: "Simple, not ordinary.",
    description: "Kesederhanaan adalah hasil dari proses berpikir yang matang.",
  },
  {
    number: "03",
    title: "Built to evolve.",
    description: "Kami percaya setiap ide dapat terus tumbuh dan berkembang.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] text-white">
      <nav className="relative z-20 border-b border-white/10">
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] text-lg font-black tracking-tighter transition duration-300 group-hover:border-blue-400/70 group-hover:bg-blue-500/10">
              H3
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-[0.2em]">
                H3 WORKS
              </div>
              <div className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-white/40">
                Creative Studio
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-9 text-xs font-medium text-white/55 md:flex">
            <Link href="/about" className="transition hover:text-white">About</Link>
            <Link href="/services" className="transition hover:text-white">Services</Link>
            <Link href="/products" className="transition hover:text-white">Products</Link>
            <Link href="/contact" className="transition hover:text-white">Contact</Link>
          </div>

          <Link
            href="/contact"
            className="group flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-500"
          >
            Let&apos;s talk
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </nav>

      <section className="relative">
        <div className="pointer-events-none absolute -right-40 top-0 h-[560px] w-[560px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 top-64 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.07] blur-[130px]" />

        <div className="relative mx-auto grid min-h-[690px] max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-28">
          <div>
            <div className="mb-9 flex items-center gap-3">
              <span className="h-px w-9 bg-blue-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400">
                Independent Creative & Digital Studio
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-[82px]">
              Ideas into
              <br />
              <span className="text-white/35">experiences.</span>
              <br />
              Technology into
              <br />
              <span className="text-blue-500">solutions.</span>
            </h1>

            <p className="mt-9 max-w-lg text-sm leading-7 text-white/50 sm:text-base">
              H3 Works Creative adalah studio kreatif dan digital yang
              menghubungkan desain, teknologi, dan ide untuk membangun
              pengalaman digital yang bermakna.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href="/services"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-xs font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 hover:text-white"
              >
                Explore what we do
                <ArrowUpRight size={15} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-medium text-white/55 transition hover:text-white"
              >
                Discover H3 Works
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="absolute -inset-5 border border-white/[0.06]" />
            <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-[#101319] p-7 sm:p-9">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-white/35">
                <span>H3 / Creative Division</span>
                <span>Est. Studio</span>
              </div>

              <div className="absolute inset-x-7 top-[27%] sm:inset-x-9">
                <div className="text-[clamp(90px,17vw,150px)] font-black leading-none tracking-[-0.12em] text-white">
                  H<span className="text-blue-500">3</span>
                </div>
                <div className="-mt-1 border-t border-white/20 pt-4">
                  <div className="text-2xl font-extrabold tracking-[0.18em] sm:text-3xl">
                    WORKS
                  </div>
                  <div className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40">
                    Creative / Digital / Technology
                  </div>
                </div>
              </div>

              <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between border-t border-white/10 pt-5 sm:bottom-9 sm:left-9 sm:right-9">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                    Our approach
                  </div>
                  <div className="mt-2 text-xs font-medium text-white/80">
                    Think. Create. Develop.
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center bg-blue-500">
                  <MoveUpRight size={19} />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-5 -z-0 h-24 w-24 border-b border-r border-blue-500/60" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:grid-cols-3 lg:px-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">01 / Discipline</div>
            <div className="mt-3 text-sm font-semibold">Creative Thinking</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">02 / Capability</div>
            <div className="mt-3 text-sm font-semibold">Digital Development</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">03 / Direction</div>
            <div className="mt-3 text-sm font-semibold">Technology Solutions</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-blue-500" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400">
                What we do
              </span>
            </div>
            <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Different disciplines.
              <br />
              <span className="text-white/35">One creative direction.</span>
            </h2>
          </div>
          <Link href="/services" className="inline-flex items-center gap-2 text-xs font-semibold text-white/55 transition hover:text-blue-400">
            View all services <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.number} className="group bg-[#08090b] p-8 transition hover:bg-[#11151d] sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.2em] text-white/35">{service.number} / 03</span>
                  <Icon size={22} strokeWidth={1.4} className="text-blue-400" />
                </div>
                <h3 className="mt-14 text-xl font-semibold tracking-tight">{service.title}</h3>
                <p className="mt-4 min-h-[84px] text-sm leading-6 text-white/45">
                  {service.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="border border-white/10 px-2.5 py-1.5 text-[9px] text-white/45">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-9 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Explore discipline</span>
                  <ArrowUpRight size={16} className="text-white/40 transition group-hover:text-blue-400" />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d1016]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-32">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-blue-500" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400">Selected product</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center border border-white/15 bg-white/[0.04]">
                <Layers3 size={23} />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">ORDERLY<span className="text-blue-500">.</span></span>
              <span className="border border-blue-500/40 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-blue-400">Beta</span>
            </div>
            <h2 className="mt-10 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
              Less manual work.
              <br />
              <span className="text-white/35">More room to grow.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/50">
              ORDERLY adalah produk digital dalam tahap beta yang dikembangkan
              untuk membantu bisnis mengelola aktivitas toko dan otomasi
              melalui satu dashboard.
            </p>
            <Link
              href="/products/orderly"
              className="mt-9 inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-500"
            >
              Explore ORDERLY <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="relative border border-white/10 bg-[#090b10] p-6 sm:p-9">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Command size={15} className="text-blue-400" />
                ORDERLY / Overview
              </div>
              <span className="text-[9px] uppercase tracking-widest text-white/35">Beta preview</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ["01", "Telegram", "Bot management"],
                ["02", "WhatsApp", "Connection management"],
                ["03", "Discord", "Bot integration"],
                ["04", "Store", "Website management"],
              ].map(([number, name, detail]) => (
                <div key={number} className="border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                  <div className="text-[9px] tracking-widest text-blue-400">{number}</div>
                  <div className="mt-5 text-sm font-semibold">{name}</div>
                  <div className="mt-1 text-[10px] text-white/35">{detail}</div>
                  <div className="mt-4 border-t border-white/10 pt-3 text-[9px] font-semibold uppercase tracking-wider text-amber-400/80">
                    In Development
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 border border-blue-500/20 bg-blue-500/[0.07] p-4">
              <Sparkles size={17} className="shrink-0 text-blue-400" />
              <p className="text-[10px] leading-5 text-white/55">
                Seluruh modul masih dalam tahap pengembangan. ORDERLY belum
                dibuka untuk penggunaan publik. Pendaftaran, pembayaran,
                dan aktivasi langganan otomatis belum tersedia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-blue-500" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400">Our philosophy</span>
            </div>
            <h2 className="text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
              Good work starts
              <br />
              with <span className="text-white/35">good thinking.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/45">
              Kami percaya karya yang baik bukan hanya tentang bagaimana
              sesuatu terlihat, tetapi juga bagaimana sesuatu bekerja dan
              memberikan nilai.
            </p>
          </div>

          <div className="border-t border-white/15">
            {principles.map((item) => (
              <div key={item.number} className="grid gap-4 border-b border-white/15 py-7 sm:grid-cols-[65px_1fr] sm:gap-6">
                <span className="pt-1 text-[10px] tracking-widest text-blue-400">{item.number}</span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/40">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-blue-500" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400">The people behind</span>
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                A small team.
                <br />
                <span className="text-white/35">A bigger perspective.</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="border-l border-blue-500 pl-4">
                <div className="text-[9px] uppercase tracking-[0.2em] text-white/35">Chief Executive Officer</div>
                <div className="mt-3 text-sm font-semibold">Genta Jaya Dilaga</div>
              </div>
              <div className="border-l border-white/20 pl-4">
                <div className="text-[9px] uppercase tracking-[0.2em] text-white/35">Chief Technology Officer</div>
                <div className="mt-3 text-sm font-semibold">Muhammad Miqdar Salim</div>
              </div>
            </div>
          </div>
          <Link href="/about" className="mt-12 inline-flex items-center gap-2 text-xs font-semibold text-white/55 transition hover:text-blue-400">
            More about H3 Works <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-blue-600/15 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
          <div className="max-w-3xl">
            <div className="mb-6 text-[10px] uppercase tracking-[0.3em] text-blue-400">Have an idea?</div>
            <h2 className="text-5xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-7xl">
              Let&apos;s make
              <br />
              something <span className="text-blue-500">meaningful.</span>
            </h2>
            <p className="mt-7 max-w-lg text-sm leading-7 text-white/45">
              Punya ide, kebutuhan digital, atau ingin berkolaborasi?
              Mari mulai percakapan.
            </p>
            <Link href="/contact" className="mt-9 inline-flex items-center gap-3 rounded-full bg-blue-500 px-7 py-4 text-xs font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-blue-400">
              Start a conversation <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div>
              <Link href="/" className="text-lg font-black tracking-[0.16em]">H3 WORKS<span className="text-blue-500">.</span></Link>
              <p className="mt-3 text-xs text-white/35">Membangun Ide. Mengembangkan Teknologi.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-xs text-white/45 sm:grid-cols-3">
              <Link href="/about" className="transition hover:text-white">About</Link>
              <Link href="/services" className="transition hover:text-white">Services</Link>
              <Link href="/products" className="transition hover:text-white">Products</Link>
              <Link href="/contact" className="transition hover:text-white">Contact</Link>
              <Link href="/terms" className="transition hover:text-white">Terms</Link>
              <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
            </div>
          </div>
          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-[10px] text-white/30 sm:flex-row">
            <span>© 2026 H3 Works Creative. All rights reserved.</span>
            <span>Creative / Digital / Technology</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
