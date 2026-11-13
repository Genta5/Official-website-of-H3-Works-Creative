import Link from "next/link";
import { ArrowUpRight, Asterisk, Layers3, Bot, MessageCircle, Store, Workflow } from "lucide-react";

function BrandMark() {
  return <span className="brand-mark" aria-label="H3 Works symbol"><span className="brand-mark__shape brand-mark__shape--one" /><span className="brand-mark__shape brand-mark__shape--two" /><span className="brand-mark__shape brand-mark__shape--three" /></span>;
}

function Footer() {
  return <footer className="bg-[#191916] text-[#f1eee6]"><div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-14">
    <div className="flex flex-col justify-between gap-10 md:flex-row"><div><Link href="/" className="brand-lockup"><BrandMark /><span className="brand-word"><strong>h3 works<span>.</span></strong><small>Independent creative studio</small></span></Link><p className="mt-5 text-xs text-white/45">Making ideas work. Developing possibilities.</p></div>
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs text-white/55 sm:grid-cols-3"><Link href="/about" className="footer-link">About</Link><Link href="/services" className="footer-link">Services</Link><Link href="/products" className="footer-link">Products</Link><Link href="/contact" className="footer-link">Contact</Link><Link href="/terms" className="footer-link">Terms</Link><Link href="/privacy" className="footer-link">Privacy</Link></div></div>
    <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 text-[9px] font-semibold uppercase tracking-widest text-white/35 sm:flex-row"><span>© {new Date().getFullYear()} H3 Works Creative. All rights reserved.</span><span>Creative / Digital / Technology</span></div>
  </div></footer>;
}

export default function ProductsPage() {
  return (
    <main className="site-shell min-h-screen overflow-hidden bg-[#f1eee6] text-[#191916]">
      <nav className="site-nav relative z-30 border-b border-black/10"><div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Link href="/" className="brand-lockup"><BrandMark /><span className="brand-word"><strong>h3 works<span>.</span></strong><small>Independent creative studio</small></span></Link>
        <div className="hidden items-center gap-9 text-[11px] font-bold md:flex"><Link className="nav-link" href="/">Home</Link>
            <Link className="nav-link" href="/about">About</Link><Link className="nav-link" href="/services">Services</Link><Link className="nav-link active" href="/products">Products</Link><Link className="nav-link" href="/contact">Contact</Link></div>
        <Link href="/contact" className="nav-cta group">Let's talk <ArrowUpRight size={15} /></Link>
      </div></nav>

      <section className="bg-[#f1eee6] py-24 sm:py-32"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="section-label mb-7 flex items-center gap-3"><Asterisk size={17} /> Products / Digital experiments</div>
        <h1 className="max-w-5xl text-6xl font-black leading-[.88] tracking-[-.085em] sm:text-8xl lg:text-[112px]">IDEAS BUILT<br />FOR THE <span className="text-[#f15a38]">DIGITAL</span><br />WORLD.</h1>
        <div className="mt-12 grid gap-8 border-t border-black/15 pt-8 md:grid-cols-2"><p className="text-xs font-bold uppercase tracking-[.2em] text-black/40">H3 Works / Product lab<br />Exploration in progress</p><p className="max-w-2xl text-base leading-8 text-black/60 sm:text-lg">Kami mengeksplorasi dan mengembangkan produk digital untuk menghadirkan pendekatan baru dalam bekerja, mengelola proses, dan membangun pengalaman digital.</p></div>
      </div></section>

      <section className="bg-[#e7e2d7] py-24 sm:py-32"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="section-label mb-7">01 / Featured product</div>
        <article className="overflow-hidden border border-black/10 bg-[#f1eee6]">
          <div className="grid md:grid-cols-[1fr_1fr]">
            <div className="flex flex-col items-start justify-between p-8 sm:p-12 lg:p-16">
              <div><div className="flex items-center gap-3"><span className="border border-[#f15a38] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#f15a38]">Beta</span><span className="text-[9px] font-bold uppercase tracking-widest text-black/40">H3 Works Product / 001</span></div>
                <h2 className="mt-10 text-6xl font-black tracking-[-.08em] sm:text-7xl">ORDERLY<span className="text-[#f15a38]">.</span></h2>
                <p className="mt-5 text-xl font-semibold">A simpler way to manage digital orders.</p>
                <p className="mt-6 max-w-lg text-sm leading-7 text-black/55">ORDERLY adalah produk SaaS yang sedang dikembangkan untuk mengeksplorasi pengelolaan pesanan dan integrasi berbagai kanal digital dalam satu sistem.</p>
              </div>
              <Link href="/products/orderly" className="nav-cta group mt-12 inline-flex">Explore ORDERLY <ArrowUpRight size={16} /></Link>
            </div>
            <div className="flex min-h-[420px] flex-col justify-between bg-[#20201c] p-7 text-[#f1eee6] sm:p-10">
              <div className="flex items-center justify-between border-b border-white/20 pb-5"><div className="flex items-center gap-3 text-sm font-black"><span className="flex h-10 w-10 items-center justify-center bg-[#f15a38] text-[#20201c]"><Layers3 size={20} /></span> ORDERLY / Overview</div><span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Beta preview</span></div>
              <div className="grid grid-cols-2 gap-3 py-8">
                {[
                  { icon: Bot, name: "Telegram", detail: "Bot management" },
                  { icon: MessageCircle, name: "WhatsApp", detail: "Connection management" },
                  { icon: Workflow, name: "Discord", detail: "Bot integration" },
                  { icon: Store, name: "Store", detail: "Website management" },
                ].map((item, index) => { const Icon = item.icon; return <div key={item.name} className="module-card border border-white/15 bg-white/[.04] p-4 sm:p-5"><span className="text-[9px] font-bold text-[#f15a38]">0{index + 1}</span><Icon className="mt-5 text-white/70" size={20} /><div className="mt-4 text-sm font-black">{item.name}</div><div className="mt-1 text-[10px] text-white/45">{item.detail}</div><div className="mt-4 border-t border-white/15 pt-3 text-[8px] font-bold uppercase tracking-widest text-[#e6a13a]">In Development</div></div>; })}
              </div>
              <div className="border border-white/15 p-4 text-[10px] leading-5 text-white/55"><Asterisk className="mr-2 inline text-[#f15a38]" size={16} />Seluruh modul masih dalam tahap pengembangan. ORDERLY belum dibuka untuk penggunaan publik.</div>
            </div>
          </div>
          <div className="border-t border-black/10 px-8 py-5 text-xs leading-6 text-black/45 sm:px-12">ORDERLY masih berada dalam tahap pengembangan beta dan belum dibuka untuk penggunaan publik. Fitur, integrasi, pendaftaran, pembayaran, dan aktivasi langganan belum tersedia.</div>
        </article>
      </div></section>

      <section className="bg-[#f15a38] py-20 text-white"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-end lg:px-14">
        <div><div className="mb-5 text-[10px] font-black uppercase tracking-[.25em] text-white/65">02 / Have an idea?</div><h2 className="text-5xl font-black leading-[.9] tracking-[-.075em] sm:text-7xl">LET'S MAKE<br />THE NEXT <span className="text-[#20201c]">THING.</span></h2></div>
        <Link href="/contact" className="inline-flex items-center gap-3 border-b border-white/60 pb-3 text-sm font-bold">Work with us <ArrowUpRight size={18} /></Link>
      </div></section>
      <Footer />
    </main>
  );
}
