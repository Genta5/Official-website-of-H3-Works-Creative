import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/" className="text-lg font-extrabold tracking-tight">H3 WORKS<span className="text-blue-500">.</span></Link>
        <Link href="/" className="text-sm text-white/60 hover:text-white"> <ArrowLeft className="mr-2 inline h-4 w-4" /> Kembali</Link>
      </nav>
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20">
        <p className="mb-6 text-xs font-bold uppercase tracking-[.3em] text-blue-400">About H3 Works</p>
        <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">Kami membangun ide menjadi pengalaman digital.</h1>
        <p className="mt-10 max-w-2xl text-lg leading-8 text-white/55">H3 Works Creative adalah studio kreatif dan teknologi yang berfokus pada komunikasi visual, pengembangan website, dan solusi digital. Kami menggabungkan kreativitas dan teknologi untuk membantu ide berkembang menjadi sesuatu yang nyata.</p>
        <div className="mt-20 grid gap-12 border-t border-white/10 pt-10 md:grid-cols-2">
          <div><p className="text-xs uppercase tracking-widest text-blue-400">01 / Vision</p><h2 className="mt-4 text-3xl font-semibold">Membuat teknologi terasa lebih dekat dan bermanfaat.</h2></div>
          <div><p className="text-xs uppercase tracking-widest text-blue-400">02 / Approach</p><h2 className="mt-4 text-3xl font-semibold">Berangkat dari ide, dibangun dengan proses yang terarah.</h2></div>
        </div>
        <div className="mt-20 border-t border-white/10 pt-10">
          <p className="text-xs uppercase tracking-widest text-blue-400">Leadership</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div><h3 className="text-2xl font-semibold">Genta Jaya Dilaga</h3><p className="mt-2 text-white/45">Chief Executive Officer</p></div>
            <div><h3 className="text-2xl font-semibold">Muhammad Miqdar Salim</h3><p className="mt-2 text-white/45">Chief Technology Officer</p></div>
          </div>
        </div>
        <Link href="/contact" className="mt-16 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">Hubungi kami <ArrowUpRight size={17}/></Link>
      </section>
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/35">© {new Date().getFullYear()} H3 Works Creative.</footer>
    </main>
  );
}
