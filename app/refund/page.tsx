import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Scope",
    body: "Halaman ini menjelaskan informasi umum mengenai penanganan permintaan pengembalian dana untuk layanan atau produk H3 Works yang telah disepakati dan benar-benar dibayar.",
  },
  {
    title: "2. ORDERLY Beta",
    body: "ORDERLY masih dalam tahap pengembangan beta dan belum dibuka untuk transaksi publik. Pendaftaran, checkout, pembayaran online, dan aktivasi langganan belum tersedia. Karena itu, website ini saat ini tidak menerima pembayaran ORDERLY.",
  },
  {
    title: "3. Refund Requests",
    body: "Untuk layanan H3 Works yang telah memiliki kesepakatan dan transaksi pembayaran, permintaan pengembalian dana dapat disampaikan melalui email atau WhatsApp dengan menyertakan informasi transaksi yang relevan. Penanganannya mengikuti kesepakatan dan ketentuan yang berlaku.",
  },
  {
    title: "4. Review Process",
    body: "Setiap permintaan akan ditinjau berdasarkan informasi transaksi, ruang lingkup layanan, dan kesepakatan terkait. H3 Works dapat meminta informasi tambahan yang diperlukan untuk melakukan verifikasi.",
  },
  {
    title: "5. Third-Party Payments",
    body: "Apabila transaksi menggunakan penyedia pembayaran pihak ketiga, proses pengembalian dana juga dapat mengikuti prosedur dan ketentuan penyedia tersebut.",
  },
  {
    title: "6. Contact",
    body: "Untuk pertanyaan mengenai kebijakan ini, hubungi H3 Works Creative melalui email creativehworks@gmail.com atau WhatsApp +62 857-1566-6568.",
  },
];

export default function RefundPage() {
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
          Legal / Refund
        </p>

        <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
          Refund Policy
        </h1>

        <p className="mt-6 text-sm text-white/40">
          Informasi umum mengenai permintaan pengembalian dana.
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
          Draf kebijakan. Ketentuan final perlu ditinjau dan disesuaikan
          dengan layanan, kesepakatan, serta proses transaksi yang benar-benar
          berlaku.
        </p>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/35">
        © {new Date().getFullYear()} H3 Works Creative.
      </footer>
    </main>
  );
}
