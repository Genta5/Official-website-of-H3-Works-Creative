import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. General Information",
    body: "Website ini dikelola oleh H3 Works Creative sebagai media informasi mengenai studio, layanan, dan produk digital yang sedang dikembangkan.",
  },
  {
    title: "2. Website Usage",
    body: "Pengunjung dapat menggunakan website ini untuk memperoleh informasi dan menghubungi H3 Works. Pengunjung dilarang menggunakan website untuk aktivitas yang melanggar hukum, mengganggu keamanan, atau merusak operasional website.",
  },
  {
    title: "3. Products and Services",
    body: "Informasi layanan dan produk di website merupakan gambaran umum dan dapat berubah. Ruang lingkup, biaya, jadwal, dan ketentuan pekerjaan akan dibahas serta disepakati secara terpisah sebelum kerja sama dimulai. Informasi di website bukan konfirmasi bahwa suatu layanan selalu tersedia.",
  },
  {
    title: "4. ORDERLY Beta",
    body: "ORDERLY merupakan produk SaaS dalam tahap pengembangan dan pengujian beta. Area fitur yang ditampilkan merupakan gambaran pengembangan dan belum tentu tersedia sebagai fitur aktif. Pendaftaran publik, paket langganan, checkout, payment gateway, pembayaran otomatis, dan aktivasi layanan otomatis belum tersedia. Informasi ORDERLY pada website bukan penawaran pembelian atau permintaan pembayaran.",
  },
  {
    title: "5. Intellectual Property",
    body: "Konten, identitas visual, desain, dan materi milik H3 Works yang ditampilkan di website dilindungi oleh ketentuan kekayaan intelektual yang berlaku. Penggunaan ulang atau distribusi materi memerlukan izin dari pemilik yang berwenang, kecuali diperbolehkan oleh hukum.",
  },
  {
    title: "6. Limitation of Liability",
    body: "Informasi website disediakan untuk tujuan informasi umum. H3 Works berupaya menjaga keakuratan informasi, tetapi tidak menjamin website selalu tersedia tanpa gangguan atau seluruh informasi selalu bebas dari kesalahan.",
  },
  {
    title: "7. Changes to These Terms",
    body: "Ketentuan ini dapat diperbarui sesuai perkembangan layanan dan kebutuhan operasional. Versi terbaru akan ditampilkan pada halaman ini.",
  },
  {
    title: "8. Contact",
    body: "Untuk pertanyaan mengenai ketentuan ini, hubungi H3 Works Creative melalui email creativehworks@gmail.com atau WhatsApp +62 857-1566-6568.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-7">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          H3 WORKS<span className="text-blue-500">.</span>
        </Link>

        <Link href="/" className="text-sm text-white/60 hover:text-white">
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Kembali
        </Link>
      </nav>

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-16">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-blue-400">
          Legal / Terms
        </p>

        <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
          Terms of Service
        </h1>

        <p className="mt-6 text-sm text-white/40">
          Ketentuan penggunaan website H3 Works Creative.
        </p>

        <div className="mt-16 divide-y divide-white/10 border-y border-white/10">
          {sections.map((section) => (
            <article key={section.title} className="py-8">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-white/50">
                {section.body}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs text-white/30">
          Dokumen ini merupakan draf informasi umum dan perlu ditinjau
          sebelum digunakan sebagai ketentuan resmi.
        </p>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/35">
        © {new Date().getFullYear()} H3 Works Creative.
      </footer>
    </main>
  );
}
