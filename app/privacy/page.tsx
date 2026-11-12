import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    body: "H3 Works Creative menghargai privasi pengunjung website. Kebijakan ini menjelaskan secara umum bagaimana informasi dapat diproses ketika Anda mengakses website atau menghubungi kami.",
  },
  {
    title: "2. Information You Provide",
    body: "Jika Anda menghubungi kami melalui email, WhatsApp, atau kanal komunikasi lainnya, informasi yang Anda sampaikan seperti nama, alamat email, nomor kontak, dan isi pesan dapat digunakan untuk memahami serta menanggapi pertanyaan atau permintaan Anda. Hindari mengirimkan informasi pribadi yang tidak diperlukan.",
  },
  {
    title: "3. Technical Information",
    body: "Penyedia hosting atau infrastruktur website dapat memproses informasi teknis tertentu, seperti alamat IP, waktu akses, jenis browser, dan catatan server, sesuai konfigurasi serta kebijakan penyedia yang digunakan.",
  },
  {
    title: "4. Use of Information",
    body: "Informasi dapat digunakan untuk menanggapi pertanyaan, membahas permintaan layanan, menjaga keamanan dan operasional website, serta memenuhi kewajiban yang berlaku.",
  },
  {
    title: "5. Sharing of Information",
    body: "H3 Works tidak bermaksud menjual informasi pribadi pengunjung. Informasi dapat diproses oleh penyedia hosting, infrastruktur, atau layanan komunikasi yang diperlukan untuk operasional website. Pemrosesan tersebut perlu mengikuti ketentuan dan perlindungan yang berlaku.",
  },
  {
    title: "6. Cookies and Similar Technologies",
    body: "Penggunaan cookies atau teknologi serupa bergantung pada fitur dan konfigurasi website maupun layanan pihak ketiga yang digunakan. Informasi mengenai teknologi tersebut perlu diperbarui apabila implementasi website berubah.",
  },
  {
    title: "7. Data Security",
    body: "H3 Works berupaya menerapkan langkah keamanan yang wajar untuk melindungi informasi. Namun, tidak ada metode transmisi atau penyimpanan elektronik yang dapat dijamin sepenuhnya aman.",
  },
  {
    title: "8. External Links",
    body: "Website dapat memuat tautan menuju layanan pihak ketiga. H3 Works tidak mengendalikan kebijakan privasi atau praktik pengelolaan data pada layanan tersebut. Pengunjung disarankan membaca kebijakan masing-masing layanan.",
  },
  {
    title: "9. Questions and Requests",
    body: "Jika memiliki pertanyaan atau permintaan terkait informasi pribadi yang pernah disampaikan kepada H3 Works, silakan hubungi kami melalui email creativehworks@gmail.com atau WhatsApp +62 857-1566-6568.",
  },
  {
    title: "10. Policy Updates",
    body: "Kebijakan ini dapat diperbarui ketika praktik operasional, konfigurasi website, atau kebutuhan layanan berubah. Perubahan akan ditampilkan pada halaman ini.",
  },
];

export default function PrivacyPage() {
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
          Legal / Privacy
        </p>

        <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
          Privacy Policy
        </h1>

        <p className="mt-6 text-sm text-white/40">
          Informasi mengenai privasi pengunjung website H3 Works Creative.
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
          Draf kebijakan. Sesuaikan isi dokumen ini dengan praktik
          pengumpulan, penyimpanan, penggunaan, dan penghapusan data
          yang benar-benar diterapkan sebelum dipublikasikan secara resmi.
        </p>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/35">
        © {new Date().getFullYear()} H3 Works Creative.
      </footer>
    </main>
  );
}
