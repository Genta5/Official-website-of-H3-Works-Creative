import Link from "next/link";
import { ArrowUpRight, Asterisk, Palette, Code2, Workflow } from "lucide-react";

const services = [
  {
    number: "01", icon: Palette, title: "Visual Communication",
    description: "Pendekatan desain visual untuk membantu brand menyampaikan pesan secara konsisten, terarah, dan mudah dikenali.",
    items: ["Brand Identity", "Graphic Design", "Social Media Design", "Visual Campaign"],
  },
  {
    number: "02", icon: Code2, title: "Website Development",
    description: "Perencanaan dan pengembangan website yang responsif, fungsional, serta disesuaikan dengan kebutuhan proyek.",
    items: ["Company Profile", "Landing Page", "Website Design", "Web Development"],
  },
  {
    number: "03", icon: Workflow, title: "Digital Solutions",
    description: "Eksplorasi dan pengembangan solusi digital untuk membantu proses kerja menjadi lebih terstruktur.",
    items: ["Digital Product", "Workflow Planning", "Automation Concepts", "Custom Digital Solutions"],
  },
];

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

export default function ServicesPage() {
  return (
    <main className="site-shell min-h-screen overflow-hidden bg-[#f1eee6] text-[#191916]">
      <nav className="site-nav relative z-30 border-b border-black/10"><div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Link href="/" className="brand-lockup"><BrandMark /><span className="brand-word"><strong>h3 works<span>.</span></strong><small>Independent creative studio</small></span></Link>
        <div className="hidden items-center gap-9 text-[11px] font-bold md:flex"><Link className="nav-link" href="/">Home</Link>
            <Link className="nav-link" href="/about">About</Link><Link className="nav-link active" href="/services">Services</Link><Link className="nav-link" href="/products">Products</Link><Link className="nav-link" href="/contact">Contact</Link></div>
        <Link href="/contact" className="nav-cta group">Let's talk <ArrowUpRight size={15} /></Link>
      </div></nav>

      <section className="bg-[#f1eee6] py-24 sm:py-32"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="section-label mb-7 flex items-center gap-3"><Asterisk size={17} /> What we do / Services</div>
        <h1 className="max-w-5xl text-6xl font-black leading-[.88] tracking-[-.085em] sm:text-8xl lg:text-[112px]">DIFFERENT<br />WAYS TO <span className="text-[#f15a38]">CREATE.</span></h1>
        <div className="mt-12 grid gap-8 border-t border-black/15 pt-8 md:grid-cols-2"><p className="text-xs font-bold uppercase tracking-[.2em] text-black/40">Our services<br />Creative / Digital / Technology</p><p className="max-w-2xl text-base leading-8 text-black/60 sm:text-lg">Kami menggabungkan pendekatan kreatif dan teknologi untuk membantu kebutuhan komunikasi visual, kehadiran digital, serta pengembangan solusi berdasarkan kebutuhan proyek.</p></div>
      </div></section>

      <section className="bg-[#e7e2d7] py-24 sm:py-32"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="mb-12 flex items-end justify-between gap-6"><div><div className="section-label mb-5">01 / Our disciplines</div><h2 className="text-4xl font-black leading-[.9] tracking-[-.07em] sm:text-6xl">WHAT WE<br />BRING TO THE <span className="text-[#f15a38]">TABLE.</span></h2></div><span className="hidden text-[10px] font-bold uppercase tracking-widest text-black/40 sm:block">Three core disciplines</span></div>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service) => { const Icon = service.icon; return <article key={service.number} className="service-card group flex min-h-[420px] flex-col border border-black/10 bg-[#f1eee6] p-7 sm:p-9">
            <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-widest text-black/40">{service.number} / 03</span><span className="service-icon"><Icon size={23} strokeWidth={1.5} /></span></div>
            <div className="mt-12 flex-1"><h3 className="max-w-xs text-2xl font-black leading-tight tracking-[-.055em]">{service.title}</h3><p className="mt-4 text-sm leading-7 text-black/55">{service.description}</p></div>
            <ul className="mt-8 grid gap-3">{service.items.map((item) => <li key={item} className="border-b border-black/10 py-2 text-xs font-semibold text-black/65">{item}</li>)}</ul>
            <div className="mt-8 flex items-center justify-between border-t border-black/15 pt-5"><span className="text-[9px] font-bold uppercase tracking-wider text-black/45">Explore discipline</span><ArrowUpRight className="service-arrow" size={19} /></div>
          </article>; })}
        </div>
      </div></section>

      <section className="bg-[#f15a38] py-24 text-white sm:py-28"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-end lg:px-14">
        <div><div className="mb-6 text-[10px] font-black uppercase tracking-[.25em] text-white/65">02 / Have a project in mind?</div><h2 className="max-w-3xl text-5xl font-black leading-[.9] tracking-[-.075em] sm:text-7xl">LET'S BUILD<br />SOMETHING <span className="text-[#20201c]">MEANINGFUL.</span></h2></div>
        <Link href="/contact" className="inline-flex items-center gap-3 border-b border-white/60 pb-3 text-sm font-bold">Discuss a project <ArrowUpRight size={18} /></Link>
      </div></section>
      <Footer />
    </main>
  );
}
