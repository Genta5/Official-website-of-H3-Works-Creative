import SiteNav from "@/components/site-nav";
import IntroAnimation from "@/components/intro-animation";
import TeamIntro from "@/components/team-intro";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Palette,
  Code2,
  Workflow,
  Layers3,
  Asterisk,
  Plus,
  MoveUpRight,
} from "lucide-react";

const services = [
  {
    number: "01",
    title: "Visual Communication",
    description: "Turning ideas into visual identities, graphics, and stories that have their own voice.",
    tags: ["Graphic Design", "Brand Identity", "Digital Content"],
    icon: Palette,
  },
  {
    number: "02",
    title: "Website Development",
    description: "Building thoughtful digital experiences where design meets function and technology.",
    tags: ["Web Design", "Development", "Landing Page"],
    icon: Code2,
  },
  {
    number: "03",
    title: "Digital Solutions",
    description: "Creating digital tools and systems that make everyday business processes work better.",
    tags: ["Automation", "Digital Product", "SaaS"],
    icon: Workflow,
  },
];

const principles = [
  { number: "01", title: "Purpose before pixels.", description: "Every creative decision starts with a reason." },
  { number: "02", title: "Simple, not ordinary.", description: "We make simplicity feel different." },
  { number: "03", title: "Built to evolve.", description: "Good ideas should never stop growing." },
];

const tickerItems = ["Creative thinking", "Digital making", "Technology", "Ideas into works"];

function BrandMark() {
  return (
    <span className="brand-mark" aria-label="H3 Works symbol">
      <span className="brand-mark__shape brand-mark__shape--one" />
      <span className="brand-mark__shape brand-mark__shape--two" />
      <span className="brand-mark__shape brand-mark__shape--three" />
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="site-shell min-h-screen overflow-hidden bg-[#f1eee6] text-[#191916]">
      <SiteNav />

      <IntroAnimation />

      <section className="bg-[#e7e2d7] py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="mb-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="section-label mb-5">01 / What we do</div>
              <h2 className="section-heading max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.075em] sm:text-7xl">
                DIFFERENT<br />WAYS TO <span>CREATE.</span>
              </h2>
            </div>
            <Link href="/services" className="text-link group">All services <ArrowUpRight size={17} /></Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.number} className="service-card group flex min-h-[370px] flex-col border border-black/10 bg-[#f1eee6] p-7 sm:p-9">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-black/40">{service.number} / 03</span>
                    <span className="service-icon"><Icon size={23} strokeWidth={1.5} /></span>
                  </div>
                  <div className="mt-12 flex-1">
                    <h3 className="max-w-xs text-2xl font-black leading-tight tracking-[-0.055em]">{service.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-black/55">{service.description}</p>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {service.tags.map((tag) => <span key={tag} className="border border-black/15 px-2.5 py-2 text-[9px] font-semibold">{tag}</span>)}
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-black/15 pt-5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-black/45">Explore discipline</span>
                    <ArrowUpRight className="service-arrow" size={19} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f1eee6] py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-14">
          <div>
            <div className="section-label mb-7 flex items-center gap-3"><Layers3 size={17} /> 02 / Our playground</div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-4xl font-black tracking-[-0.07em] sm:text-5xl">ORDERLY<span className="text-[#f15a38]">.</span></h2>
              <span className="border border-[#f15a38] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#f15a38]">Beta</span>
            </div>
            <h3 className="mt-10 text-5xl font-black leading-[0.95] tracking-[-0.07em] sm:text-6xl">
              LESS MANUAL.<br /><span className="text-[#f15a38]">MORE POSSIBLE.</span>
            </h3>
            <p className="mt-7 max-w-md text-sm leading-7 text-black/55">
              ORDERLY adalah produk digital yang sedang kami kembangkan untuk membantu bisnis mengelola aktivitas toko dan otomasi melalui satu sistem.
            </p>
            <Link href="/products/orderly" className="nav-cta mt-9 inline-flex">Discover ORDERLY <ArrowUpRight size={16} /></Link>
            <div className="mt-12 flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-black/40">
              <span className="live-dot live-dot--amber" /> Product in development
            </div>
          </div>

          <div className="orderly-panel relative bg-[#20201c] p-6 text-[#f1eee6] sm:p-9">
            <div className="flex items-center justify-between border-b border-white/20 pb-5">
              <div className="flex items-center gap-3 text-sm font-black">
                <div className="flex h-9 w-9 items-center justify-center bg-[#f15a38]"><Layers3 size={19} /></div>
                ORDERLY / Overview
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Beta preview</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ["01", "Telegram", "Bot management"],
                ["02", "WhatsApp", "Connection management"],
                ["03", "Discord", "Bot integration"],
                ["04", "Store", "Website management"],
              ].map(([number, name, detail]) => (
                <div key={number} className="module-card border border-white/15 bg-white/[0.04] p-4 sm:p-6">
                  <div className="text-[9px] font-bold text-[#f15a38]">{number}</div>
                  <div className="mt-6 text-sm font-black">{name}</div>
                  <div className="mt-1 text-[10px] text-white/45">{detail}</div>
                  <div className="mt-5 border-t border-white/15 pt-3 text-[8px] font-bold uppercase tracking-widest text-[#e6a13a]">In Development</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3 border border-white/15 p-4">
              <Asterisk size={19} className="shrink-0 text-[#f15a38]" />
              <p className="text-[10px] leading-5 text-white/55">
                Seluruh modul masih dalam tahap pengembangan. ORDERLY belum dibuka untuk penggunaan publik. Pendaftaran, pembayaran, dan aktivasi langganan otomatis belum tersedia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="philosophy-section bg-[#f15a38] py-24 text-white sm:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-14">
          <div>
            <div className="mb-7 text-[10px] font-black uppercase tracking-[0.25em] text-white/65">03 / Our philosophy</div>
            <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.075em] sm:text-7xl">THINK<br />BEFORE<br />YOU<br /><span className="text-[#20201c]">MAKE.</span></h2>
            <p className="mt-8 max-w-sm text-sm leading-7 text-white/75">Karya yang baik bukan hanya tentang bagaimana sesuatu terlihat, tetapi juga bagaimana sesuatu bekerja dan memberikan nilai.</p>
          </div>
          <div className="border-t border-white/35">
            {principles.map((item) => (
              <div key={item.number} className="principle-row grid gap-4 border-b border-white/35 py-8 sm:grid-cols-[70px_1fr]">
                <span className="text-xs font-black text-white/60">{item.number}</span>
                <div>
                  <h3 className="text-2xl font-black tracking-[-0.05em] sm:text-3xl">{item.title}</h3>
                  <p className="mt-3 text-sm text-white/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e7e2d7] py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="section-label mb-6">04 / The people behind</div>
              <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.075em] sm:text-7xl">SMALL<br />TEAM.<br /><span className="text-black/30">BIG IDEAS.</span></h2>
            </div>
            <p className="max-w-xs text-sm leading-7 text-black/55">Two different perspectives, one shared ambition: making ideas happen through creativity and technology.</p>
          </div>
          <TeamIntro />
          <Link href="/about" className="text-link mt-9">More about us <ArrowUpRight size={16} /></Link>
        </div>
      </section>

      <section className="contact-section relative overflow-hidden bg-[#20201c] py-28 text-[#f1eee6] sm:py-36">
        <div className="contact-rings pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="contact-rings contact-rings--two pointer-events-none absolute -right-12 -top-12 h-72 w-72 rounded-full border border-white/10" />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="mb-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f15a38]"><Asterisk size={19} /> 05 / Have an idea?</div>
          <h2 className="max-w-5xl text-6xl font-black leading-[0.85] tracking-[-0.085em] sm:text-8xl lg:text-[120px]">LET'S MAKE<br />SOMETHING<br /><span className="text-[#f15a38]">MATTER.</span></h2>
          <div className="mt-12 flex flex-col justify-between gap-8 border-t border-white/20 pt-8 sm:flex-row sm:items-end">
            <p className="max-w-md text-sm leading-7 text-white/50">Punya ide, kebutuhan digital, atau ingin berkolaborasi? Mari mulai sesuatu yang menarik bersama.</p>
            <Link href="/contact" className="contact-cta group">Start a conversation <ArrowUpRight size={18} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#191916] text-[#f1eee6]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-14">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div>
              <Link href="/" className="brand-lockup">
                <BrandMark />
                <span className="brand-word"><strong>h3 works<span>.</span></strong><small>Independent creative studio</small></span>
              </Link>
              <p className="mt-5 text-xs text-white/45">Making ideas work. Developing possibilities.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs text-white/55 sm:grid-cols-3">
              <Link href="/about" className="footer-link">About</Link>
              <Link href="/services" className="footer-link">Services</Link>
              <Link href="/products" className="footer-link">Products</Link>
              <Link href="/contact" className="footer-link">Contact</Link>
              <Link href="/terms" className="footer-link">Terms</Link>
              <Link href="/privacy" className="footer-link">Privacy</Link>
            </div>
          </div>
          <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 text-[9px] font-semibold uppercase tracking-widest text-white/35 sm:flex-row">
            <span>© 2026 H3 Works Creative. All rights reserved.</span>
            <span>Creative / Digital / Technology</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
