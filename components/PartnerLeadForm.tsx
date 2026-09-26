"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Loader2, MapPin, Send } from "lucide-react";
import { Button, Input } from "@/components/ui/primitives";
import { Select } from "@/components/ui/Select";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";
import { useRegion } from "@/components/providers/RegionProvider";
import { ENABLED_MARKETS } from "@/lib/markets";
import { categories } from "@/lib/mock-data";
import type { CategoryId } from "@/lib/types";
import { parseApiResult } from "@/lib/api-result";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

export function PartnerLeadForm() {
  const { city: userCity } = useRegion();
  const formId = useId();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(userCity.name);
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const cities = useMemo(() => {
    const list = ENABLED_MARKETS.flatMap((m) => m.cities.map((c) => c.name));
    return Array.from(new Set(list)).sort();
  }, []);

  function toggleCategory(id: CategoryId) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError("Для отправки заявки необходимо согласие с политикой конфиденциальности.");
      setStatus("error");
      return;
    }
    if (turnstileEnabled && !turnstileToken) {
      setError("Подождите завершения проверки «я не робот».");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/partner-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactName: contactName || undefined,
          phone,
          city,
          categoryIds: selectedCategories,
          message: message || undefined,
          consent,
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      const data = parseApiResult(await res.json());
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Не удалось отправить заявку. Попробуйте ещё раз.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Не удалось отправить заявку. Попробуйте ещё раз.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="font-display text-xl font-bold text-foreground">Заявка отправлена</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Мы свяжемся с вами по номеру {phone}, обсудим размещение и ответим на вопросы.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-6 sm:p-8"
    >
      <div>
        <h3 className="font-display text-xl font-bold text-foreground">Заявка на размещение</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Расскажите о компании: мы свяжемся, поможем с карточкой и ответим на вопросы.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-company`} className="text-xs font-medium text-muted-foreground">Название компании *</label>
          <Input
            id={`${formId}-company`}
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Например, «Чистый дом»"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-contact`} className="text-xs font-medium text-muted-foreground">Контактное лицо</label>
          <Input
            id={`${formId}-contact`}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Как к вам обращаться"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-phone`} className="text-xs font-medium text-muted-foreground">Телефон *</label>
          <Input
            id={`${formId}-phone`}
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+375 29 ... / +7 999 ..."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-city`} className="text-xs font-medium text-muted-foreground">Город</label>
          <Select
            value={city}
            onChange={setCity}
            icon={<MapPin className="h-4 w-4" />}
            options={cities.map((c) => ({ value: c, label: c }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Какие услуги оказываете</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                selectedCategories.includes(cat.id)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-message`} className="text-xs font-medium text-muted-foreground">Комментарий</label>
        <textarea
          id={`${formId}-message`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ссылка на сайт или профиль, вопросы по размещению..."
          rows={3}
          className="rounded-2xl border border-border bg-card px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <TurnstileWidget onToken={setTurnstileToken} />

      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}

      <label className="flex cursor-pointer items-start gap-2.5 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span>
          Я согласен с{" "}
          <Link href="/privacy" target="_blank" className="text-primary underline hover:no-underline">
            политикой конфиденциальности
          </Link>
          {" "}и обработкой указанных данных для связи по размещению.
        </span>
      </label>

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Отправляем...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Отправить заявку
          </>
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" />
        Базовое размещение в каталоге бесплатно. Платные опции обсуждаются после заявки.
      </p>
    </form>
  );
}
