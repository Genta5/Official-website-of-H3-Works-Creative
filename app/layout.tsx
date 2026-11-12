import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "H3 Works Creative — Ideas Into Experiences",
    template: "%s | H3 Works Creative",
  },
  description:
    "H3 Works Creative is a creative and technology studio focused on visual communication, website development, and digital solutions.",
  applicationName: "H3 Works Creative",
  keywords: [
    "H3 Works",
    "Creative Studio",
    "Graphic Design",
    "Website Development",
    "Digital Solutions",
    "ORDERLY",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
