import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { RegionProvider } from "@/components/providers/RegionProvider";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });

const description =
  "Решения задач чистоты, честный рейтинг клининговых компаний и бренды для профи в Беларуси. Открытые источники оценки, прямые контакты.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — найдите решение любой задачи чистоты`,
    template: `%s | ${SITE_NAME}`,
  },
  description,
  keywords: ["клининг", "уборка", "химчистка", "рейтинг клининговых компаний", "клининг Минск", "клининг Брест", "химчистка мебели Минск"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ru_BY",
    url: SITE_URL,
    title: `${SITE_NAME} — найдите решение любой задачи чистоты`,
    description,
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: true, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5fbfb" },
    { media: "(prefers-color-scheme: dark)", color: "#071114" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem("ch_theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(!t&&d)){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light"}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <RegionProvider>{children}</RegionProvider>
      </body>
    </html>
  );
}
