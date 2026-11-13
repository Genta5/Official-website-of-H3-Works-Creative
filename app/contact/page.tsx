import SiteNav from "@/components/site-nav";
import Link from "next/link";
import { ArrowUpRight, Asterisk, Mail, MessageCircle } from "lucide-react";

const email = "creativehworks@gmail.com";
const whatsapp = "6285715666568";
const whatsappMessage = "Halo H3 Works, saya ingin bertanya tentang layanan dan kemungkinan kerja sama.";

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

export default function ContactPage() {
  return (
    <main className="site-shell min-h-screen overflow-hidden bg-[#f1eee6] text-[#191916]">
      <SiteNav />

      <section className="bg-[#f1eee6] py-24 sm:py-32"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="section-label mb-7 flex items-center gap-3"><Asterisk size={17} /> Contact / Get in touch</div>
        <h1 className="max-w-5xl text-6xl font-black leading-[.88] tracking-[-.085em] sm:text-8xl lg:text-[112px]">LET'S START<br />A <span className="text-[#f15a38]">CONVERSATION.</span></h1>
        <div className="mt-12 grid gap-8 border-t border-black/15 pt-8 md:grid-cols-2"><p className="text-xs font-bold uppercase tracking-[.2em] text-black/40">H3 Works Creative<br />Indonesia</p><p className="max-w-2xl text-base leading-8 text-black/60 sm:text-lg">Punya ide, pertanyaan, atau ingin mendiskusikan sebuah proyek? Hubungi H3 Works dan mari mulai percakapan.</p></div>
      </div></section>

      <section className="bg-[#e7e2d7] py-24 sm:py-32"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="section-label mb-7">01 / Choose your channel</div>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="group flex min-h-[390px] flex-col border border-black/10 bg-[#f1eee6] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#f15a38]/60 sm:p-10">
            <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-widest text-black/40">01 / GENERAL INQUIRY</span><span className="service-icon"><Mail size={23} /></span></div>
            <div className="mt-14 flex-1"><h2 className="text-3xl font-black tracking-[-.06em]">Send us an email.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-black/55">Untuk pertanyaan umum, kerja sama, dan informasi layanan H3 Works.</p><p className="mt-7 break-all text-sm font-semibold text-black/75">{email}</p></div>
            <a href={`mailto:${email}?subject=Inquiry%20-%20H3%20Works`} className="mt-8 inline-flex items-center gap-3 border-b border-black/20 pb-3 text-xs font-bold transition hover:border-[#f15a38]">Kirim Email <ArrowUpRight size={16} /></a>
          </article>
          <article className="group flex min-h-[390px] flex-col border border-black/10 bg-[#f1eee6] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#f15a38]/60 sm:p-10">
            <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-widest text-black/40">02 / PROJECT DISCUSSION</span><span className="service-icon"><MessageCircle size={23} /></span></div>
            <div className="mt-14 flex-1"><h2 className="text-3xl font-black tracking-[-.06em]">Let's talk on WhatsApp.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-black/55">Untuk diskusi kebutuhan desain, website, maupun pengembangan solusi digital.</p><p className="mt-7 text-sm font-semibold text-black/75">+62 857-1566-6568</p></div>
            <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-3 border-b border-black/20 pb-3 text-xs font-bold transition hover:border-[#f15a38]">Chat via WhatsApp <ArrowUpRight size={16} /></a>
          </article>
        </div>
      </div></section>

      <section className="contact-section relative overflow-hidden bg-[#20201c] py-24 text-[#f1eee6] sm:py-32">
        <div className="contact-rings pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="mb-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.25em] text-[#f15a38]"><Asterisk size={19} /> H3 Works Creative</div>
          <h2 className="max-w-5xl text-5xl font-black leading-[.88] tracking-[-.08em] sm:text-7xl lg:text-8xl">GOOD IDEAS<br />START WITH A<br /><span className="text-[#f15a38]">CONVERSATION.</span></h2>
          <p className="mt-10 max-w-md text-sm leading-7 text-white/50">Tell us what you have in mind. We would love to hear about it.</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
