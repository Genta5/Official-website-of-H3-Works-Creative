import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Palette,
  Code2,
  Workflow,
} from "lucide-react";

const services = [
  {
    number: "01",
    icon: Palette,
    title: "Visual Communication",
    description:
      "Pendekatan desain visual untuk membantu brand menyampaikan pesan secara konsisten, terarah, dan mudah dikenali.",
    items: [
      "Brand Identity",
      "Graphic Design",
      "Social Media Design",
      "Visual Campaign",
    ],
  },
  {
    number: "02",
    icon: Code2,
    title: "Website Development",
    description:
      "Perencanaan dan pengembangan website yang responsif, fungsional, serta disesuaikan dengan kebutuhan proyek.",
    items: [
      "Company Profile",
      "Landing Page",
      "Website Design",
      "Web Development",
    ],
  },
  {
    number: "03",
    icon: Workflow,
    title: "Digital Solutions",
    description:
      "Eksplorasi dan pengembangan solusi digital untuk membantu proses kerja menjadi lebih terstruktur.",
    items: [
      "Digital Product",
      "Workflow Planning",
      "Automation Concepts",
      "Custom Digital Solutions",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          H3 WORKS<span className="text-blue-500">.</span>
        </Link>

        <Link href="/" className="text-sm text-white/60 hover:text-white">
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Kembali
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20">
        <p className="mb-6 text-xs font-bold uppercase tracking-[.3em] text-blue-400">
          What We Do / Services
        </p>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Creative thinking. Practical technology.
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/50">
          Kami menggabungkan pendekatan kreatif dan teknologi untuk
          membantu kebutuhan komunikasi visual, kehadiran digital,
          serta pengembangan solusi berdasarkan kebutuhan proyek.
        </p>

        <div className="mt-20 divide-y divide-white/10 border-y border-white/10">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.number}
                className="grid gap-8 py-12 md:grid-cols-[1fr_2fr]"
              >
                <div>
                  <p className="text-xs tracking-widest text-blue-400">
                    {service.number} / SERVICE
                  </p>

                  <Icon
                    className="mt-8 h-9 w-9 text-white/70"
                    strokeWidth={1.5}
                  />

                  <h2 className="mt-5 text-3xl font-semibold">
                    {service.title}
                  </h2>
                </div>

                <div>
                  <p className="max-w-xl text-lg leading-8 text-white/55">
                    {service.description}
                  </p>

                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className="border-b border-white/10 py-3 text-sm text-white/75"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-20 flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-white/[.03] p-8 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-400">
              Have a project in mind?
            </p>

            <h2 className="mt-3 text-3xl font-semibold">
              Let’s build something meaningful.
            </h2>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            Discuss a project <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/35">
        © {new Date().getFullYear()} H3 Works Creative.
      </footer>
    </main>
  );
}
