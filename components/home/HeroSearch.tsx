"use client";

import { SmartSearch } from "@/components/SmartSearch";
import { useHeroAssistant } from "@/components/home/HeroAssistant";

/** Поле поиска в hero: Enter / «Спросить ИИ» отправляют запрос технологу, ответ — в слоте справа. */
export function HeroSearch() {
  const { ask, setQuery } = useHeroAssistant();
  return <SmartSearch bare ask={ask} setQuery={setQuery} />;
}
