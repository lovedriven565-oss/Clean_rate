import type { Metadata } from "next";
import { pageAlternates, pageSocialMeta } from "@/lib/site";

const title = "Разместить клининговую компанию";
const description =
  "Подтвердите профиль компании в каталоге: прямые обращения без посредника, открытый источник рейтинга и честно помеченное партнёрское размещение.";

export const metadata: Metadata = {
  title,
  description,
  alternates: pageAlternates("/for-partners"),
  ...pageSocialMeta("/for-partners", title, description),
};

export default function ForPartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
