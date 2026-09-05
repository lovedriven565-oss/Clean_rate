import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { RegionProvider } from "@/components/providers/RegionProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Клининг Рейтинг — каталог клининговых компаний Минска",
  description:
    "Честный каталог клининговых компаний Минска: реальные контакты, цены и открыто помеченные партнёры платформы. Без накрутки рейтинга.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <RegionProvider>{children}</RegionProvider>
      </body>
    </html>
  );
}
