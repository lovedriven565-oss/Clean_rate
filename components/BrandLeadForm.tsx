"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button, Input } from "@/components/ui/primitives";
import { Select } from "@/components/ui/Select";
import { TurnstileWidget, turnstileEnabled } from "@/components/TurnstileWidget";
import { parseApiResult } from "@/lib/api-result";

type Status = "idle" | "submitting" | "success" | "error";

const roles = [
  { value: "brand", label: "Производитель / бренд" },
  { value: "dealer", label: "Импортёр / дилер" },
  { value: "service", label: "Сервисный центр" },
  { value: "other", label: "Другая роль" },
];

export function BrandLeadForm() {
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("brand");
  const [goal, setGoal] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!consent) {
      setStatus("error");
      setError("Необходимо согласие с политикой конфиденциальности.");
      return;
    }
    if (turnstileEnabled && !turnstileToken) {
      setStatus("error");
      setError("Подождите завершения проверки «я не робот».");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/brand-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          website,
          contactName,
          contact,
          role,
          goal,
          consent,
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      const result = parseApiResult(await response.json());
      if (!response.ok || !result.ok) {
        setStatus("error");
        setError(result.error ?? "Не удалось отправить заявку.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center rounded-panel border border-border bg-card p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-foreground">Заявка принята</h3>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Свяжемся по указанному контакту и обсудим пилот без обещаний неподтверждённого охвата.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-panel border border-border bg-card p-6 shadow-xl shadow-tint/5 sm:p-8">
      <h3 className="font-display text-2xl font-bold text-foreground">Обсудить пилот</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Расскажите, какую задачу бренда должна решить платформа.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs font-semibold text-foreground">
          Бренд или компания
          <Input required value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder="Название" />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-foreground">
          Сайт
          <Input type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-foreground">
          Контактное лицо
          <Input required value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Имя" />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-foreground">
          Телефон или email
          <Input required value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Как с вами связаться" />
        </label>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold text-foreground">Роль на рынке</span>
        <Select value={role} onChange={setRole} options={roles} label="Роль на рынке" />
      </div>

      <label className="mt-4 flex flex-col gap-2 text-xs font-semibold text-foreground">
        Задача и желаемый результат
        <textarea
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          rows={4}
          placeholder="Например: представить новую линейку профессиональным компаниям и получить запросы на демонстрацию"
          className="rounded-control border border-border bg-card px-4 py-3 text-sm font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <div className="mt-4">
        <TurnstileWidget onToken={setTurnstileToken} />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted-foreground">
        <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
        <span>
          Я согласен с <Link href="/privacy" target="_blank" className="font-semibold text-primary underline">политикой конфиденциальности</Link> и обработкой данных для связи.
        </span>
      </label>

      <Button type="submit" size="lg" disabled={status === "submitting"} className="mt-6 w-full">
        {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {status === "submitting" ? "Отправляем" : "Отправить заявку"}
      </Button>
    </form>
  );
}
