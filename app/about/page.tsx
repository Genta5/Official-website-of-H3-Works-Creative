import SiteNav from "@/components/site-nav";
import Link from "next/link";
import { ArrowUpRight, Asterisk, Palette, Code2, Workflow } from "lucide-react";

function BrandMark() {
  return (
    <span className="brand-mark" aria-label="H3 Works symbol">
      <span className="brand-mark__shape brand-mark__shape--one" />
      <span className="brand-mark__shape brand-mark__shape--two" />
      <span className="brand-mark__shape brand-mark__shape--three" />
    </span>
  );
}

function Footer() {
  return (
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
          <span>© {new Date().getFullYear()} H3 Works Creative. All rights reserved.</span>
          <span>Creative / Digital / Technology</span>
        </div>
      </div>
    </footer>
  );
}

export default function AboutPage() {
  return (
    <main className="site-shell min-h-screen overflow-hidden bg-[#f1eee6] text-[#191916]">
      <SiteNav />

      <section className="about-hero bg-[#f1eee6] py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-4 lg:px-14">
          <div className="relative z-10">
            <div className="section-label mb-7 flex items-center gap-3"><Asterisk size={17} /> About H3 Works / 01</div>
            <h1 className="max-w-4xl text-6xl font-black leading-[0.88] tracking-[-0.085em] sm:text-8xl lg:text-[clamp(64px,7.4vw,108px)]">
              IDEAS INTO<br /><span className="text-[#f15a38]">SOMETHING</span><br />MEANINGFUL.
            </h1>
            <div className="mt-10 grid gap-6 border-t border-black/15 pt-7 sm:grid-cols-[.7fr_1.3fr]">
              <p className="text-xs font-bold uppercase tracking-[.2em] leading-6 text-black/40">Independent creative studio<br />Creative / Digital / Technology</p>
              <p className="max-w-2xl text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
                H3 Works Creative adalah studio kreatif dan teknologi yang berfokus pada komunikasi visual, pengembangan website, dan solusi digital. Kami menggabungkan kreativitas dan teknologi untuk membantu ide berkembang menjadi sesuatu yang nyata.
              </p>
            </div>
          </div>

          <div className="about-globe-wrap" aria-label="Orbit bahasa pemrograman">
            <div className="globe-caption"><span className="globe-caption-dot" /> OUR DIGITAL UNIVERSE</div>
            <div className="programming-globe">
              <div className="globe-orbit globe-orbit-one">
                <span className="globe-tag tag-html">HTML</span>
                <span className="globe-tag tag-react">REACT</span>
                <span className="globe-tag tag-python">PYTHON</span>
                <span className="globe-tag tag-css">CSS</span>
              </div>
              <div className="globe-orbit globe-orbit-two">
                <span className="globe-tag tag-js">JAVASCRIPT</span>
                <span className="globe-tag tag-next">NEXT.JS</span>
                <span className="globe-tag tag-ts">TYPESCRIPT</span>
              </div>
              <div className="globe-core">
                <div className="globe-grid-lines" />
                <div className="globe-core-content">
                  <span>H3</span>
                  <small>CREATIVE<br />TECHNOLOGY</small>
                </div>
              </div>
              <span className="globe-satellite satellite-one" />
              <span className="globe-satellite satellite-two" />
            </div>
            <div className="globe-footnote">CODE / DESIGN / POSSIBILITY <span>— 001</span></div>
          </div>
        </div>
      </section>

      <section className="bg-[#e7e2d7] py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="section-label mb-7">02 / What drives us</div>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="border border-black/10 bg-[#f1eee6] p-8 sm:p-10">
              <span className="text-[10px] font-black tracking-widest text-black/40">01 / VISION</span>
              <h2 className="mt-12 max-w-md text-4xl font-black leading-[.95] tracking-[-.065em] sm:text-5xl">Technology should feel closer and more useful.</h2>
              <p className="mt-6 text-sm leading-7 text-black/55">Membuat teknologi terasa lebih dekat, mudah dipahami, dan memberikan manfaat dalam kehidupan sehari-hari.</p>
            </article>
            <article className="border border-black/10 bg-[#f1eee6] p-8 sm:p-10">
              <span className="text-[10px] font-black tracking-widest text-black/40">02 / APPROACH</span>
              <h2 className="mt-12 max-w-md text-4xl font-black leading-[.95] tracking-[-.065em] sm:text-5xl">From thoughtful ideas to purposeful work.</h2>
              <p className="mt-6 text-sm leading-7 text-black/55">Berangkat dari ide, dibangun dengan proses yang terarah, dan terus berkembang melalui eksplorasi.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#f1eee6] py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="section-label mb-7">03 / Our disciplines</div>
          <h2 className="mb-12 max-w-3xl text-5xl font-black leading-[.9] tracking-[-.075em] sm:text-7xl">THREE FIELDS.<br /><span className="text-black/30">ONE DIRECTION.</span></h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Palette, title: "Visual Communication", detail: "Turning messages into meaningful visual experiences." },
              { icon: Code2, title: "Website Development", detail: "Building thoughtful digital experiences and websites." },
              { icon: Workflow, title: "Digital Solutions", detail: "Exploring tools and systems for better workflows." },
            ].map((item, index) => {
              const Icon = item.icon;
              return <article key={item.title} className="border border-black/10 bg-[#e7e2d7] p-7 sm:p-9">
                <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-widest text-black/40">0{index + 1} / 03</span><Icon size={23} strokeWidth={1.5} /></div>
                <h3 className="mt-16 text-2xl font-black tracking-[-.055em]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-black/55">{item.detail}</p>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#20201c] py-24 text-[#f1eee6] sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="mb-12 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.25em] text-[#f15a38]"><Asterisk size={18} /> 04 / The people behind</div>
          <h2 className="mb-14 text-5xl font-black leading-[.9] tracking-[-.075em] sm:text-7xl">THE PEOPLE<br />MAKING IT <span className="text-[#f15a38]">WORK.</span></h2>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="border border-white/15 bg-white/[.04] p-8 sm:p-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#f15a38]">01 / Leadership</span>
              <h3 className="mt-12 text-3xl font-black tracking-[-.05em] sm:text-4xl">Genta Jaya Dilaga</h3>
              <p className="mt-3 text-xs uppercase tracking-[.18em] text-white/45">Chief Executive Officer</p>
            </article>
            <article className="border border-white/15 bg-white/[.04] p-8 sm:p-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#f15a38]">02 / Technology</span>
              <h3 className="mt-12 text-3xl font-black tracking-[-.05em] sm:text-4xl">Muhammad Miqdar Salim</h3>
              <p className="mt-3 text-xs uppercase tracking-[.18em] text-white/45">Chief Technology Officer</p>
            </article>
          </div>
          <Link href="/contact" className="contact-cta group mt-12 inline-flex">Start a conversation <ArrowUpRight size={17} /></Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
