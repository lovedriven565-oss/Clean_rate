import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og/template";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — решения задач чистоты`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    eyebrow: "Беларусь · Минск и Брест",
    title: "Пятно, запах, налёт? Покажем, как убрать или кого позвать",
    subtitle: "Пошаговые протоколы, честная граница «звать мастера» и компании города без посредников.",
  });
}
