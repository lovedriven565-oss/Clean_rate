"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { Button, Input } from "@/components/ui/primitives";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/rating?q=${encodeURIComponent(value)}` : "/rating");
  }

  return (
    <form onSubmit={handleSubmit} className="glass flex w-full max-w-2xl flex-col gap-2 rounded-[1.35rem] p-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Поиск по платформе"
          placeholder="Компания, услуга, бренд или оборудование"
          className="h-13 border-transparent bg-transparent pl-11 shadow-none focus:border-transparent"
        />
      </div>
      <Button type="submit" size="lg" className="h-13 shrink-0 px-6">
        Найти
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
