import type { Metadata } from "next";
import { pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Разместить клининговую компанию",
  description:
    "Подтвердите профиль компании в каталоге: прямые обращения без посредника, открытый источник рейтинга и честно помеченное партнёрское размещение.",
  alternates: pageAlternates("/for-partners"),
};

export default function ForPartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
