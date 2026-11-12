import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
  MessageCircle,
} from "lucide-react";

const email = "creativehworks@gmail.com";
const whatsapp = "6285715666568";
const whatsappMessage =
  "Halo H3 Works, saya ingin bertanya tentang layanan dan kemungkinan kerja sama.";

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] text-lg font-black tracking-tighter transition group-hover:border-blue-400/70 group-hover:bg-blue-500/10">
            H3
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-[0.2em]">
              H3 WORKS
            </span>
            <span className="mt-0.5 block text-[9px] uppercase tracking-[0.28em] text-white/40">
              Creative Studio
            </span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-xs text-white/60 transition hover:border-blue-400 hover:text-white"
        >
          <ArrowLeft size={14} /> Kembali
        </Link>
      </nav>

      <section className="relative mx-auto max-w-6xl px-6 pb-28 pt-20 sm:pt-28">
        <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="relative">
          <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[.3em] text-blue-400">
            <span className="h-px w-8 bg-blue-500" />
            Contact / Get in Touch
          </p>

          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            Let’s start a
            <span className="text-blue-500"> conversation.</span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-white/50 sm:text-lg">
            Punya ide, pertanyaan, atau ingin mendiskusikan sebuah proyek?
            Hubungi H3 Works dan mari mulai percakapan.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <article className="group rounded-3xl border border-white/10 bg-white/[.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[.045] sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500 group-hover:text-white">
                <Mail size={23} />
              </div>

              <h2 className="mt-7 text-2xl font-semibold">
                General Inquiry
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/45">
                Untuk pertanyaan umum, kerja sama, dan informasi layanan H3
                Works.
              </p>

              <p className="mt-7 break-all text-sm text-white/75">{email}</p>

              <a
                href={`mailto:${email}?subject=Inquiry%20-%20H3%20Works`}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-xs font-semibold transition hover:border-blue-400 hover:bg-blue-500"
              >
                Kirim Email <ArrowUpRight size={15} />
              </a>
            </article>

            <article className="group rounded-3xl border border-white/10 bg-white/[.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[.045] sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500 group-hover:text-white">
                <MessageCircle size={23} />
              </div>

              <h2 className="mt-7 text-2xl font-semibold">
                Project Discussion
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/45">
                Untuk diskusi kebutuhan desain, website, maupun pengembangan
                solusi digital.
              </p>

              <p className="mt-7 text-sm text-white/75">
                +62 857-1566-6568
              </p>

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Chat via WhatsApp <ArrowUpRight size={15} />
              </a>
            </article>
          </div>

          <p className="mt-12 text-xs leading-6 text-white/30">
            H3 Works Creative · Indonesia
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/35">
        © {new Date().getFullYear()} H3 Works Creative. All rights reserved.
      </footer>
    </main>
  );
}
