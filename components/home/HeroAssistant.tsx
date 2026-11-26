"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Loader2, X } from "lucide-react";
import { useAssistantConsult } from "@/lib/assistant/useAssistantConsult";
import type { AssistantAnswer, AssistantTiming } from "@/lib/assistant/engine";
import { PhotoAssist } from "@/components/assistant/PhotoAssist";
import { trackEvent } from "@/lib/analytics";

export interface HeroAskContext {
  timing?: AssistantTiming;
  material?: string;
}

interface HeroAssistantValue {
  query: string;
  setQuery: (value: string) => void;
  context: HeroAskContext;
  setTiming: (timing?: AssistantTiming) => void;
  setMaterial: (material?: string) => void;
  ask: (query: string, override?: HeroAskContext) => void;
  reset: () => void;
  loading: boolean;
  answer: AssistantAnswer | null;
  active: boolean;
  /** Показывает готовый ответ из фото-триажа в том же слоте hero. */
  applyPhotoAnswer: (answer: AssistantAnswer) => void;
}

const HeroAssistantContext = createContext<HeroAssistantValue | null>(null);

/**
 * Состояние ИИ-технолога в hero главной: единое поле поиска + ответ на месте.
 * Оборачивает grid hero, чтобы левая колонка (SmartSearch) и правая (слот ответа) делили состояние.
 */
export function HeroAssistantProvider({ children }: { children: ReactNode }) {
  const { answer, loading, consult, applyAnswer } = useAssistantConsult();
  const [query, setQuery] = useState("");
  const [context, setContext] = useState<HeroAskContext>({});
  const [active, setActive] = useState(false);
  // Ref, а не state: чипы в карточке меняют контекст и сразу вызывают ask в том же тике.
  const contextRef = useRef<HeroAskContext>({});

  const ask = useCallback(
    (nextQuery: string, override?: HeroAskContext) => {
      const trimmed = nextQuery.trim();
      if (trimmed.length < 2) return;
      const merged = { ...contextRef.current, ...override };
      contextRef.current = merged;
      setContext(merged);
      setQuery(trimmed);
      setActive(true);
      trackEvent({
        entityType: "page",
        entityId: "/assistant",
        eventType: "view",
        metadata: {
          placement: "home.assistant",
          source: "inline",
          step: merged.timing ? "timed" : "initial",
        },
      });
      void consult({ message: trimmed, timing: merged.timing, material: merged.material });
    },
    [consult]
  );

  const setTiming = useCallback((timing?: AssistantTiming) => {
    contextRef.current = { ...contextRef.current, timing };
    setContext(contextRef.current);
  }, []);

  const setMaterial = useCallback((material?: string) => {
    contextRef.current = { ...contextRef.current, material };
    setContext(contextRef.current);
  }, []);

  const reset = useCallback(() => {
    setActive(false);
    contextRef.current = {};
    setContext({});
  }, []);

  const applyPhotoAnswer = useCallback(
    (next: AssistantAnswer) => {
      setQuery("По фото загрязнения");
      contextRef.current = {};
      setContext({});
      setActive(true);
      applyAnswer(next);
    },
    [applyAnswer]
  );

  const value = useMemo<HeroAssistantValue>(
    () => ({
      query,
      setQuery,
      context,
      setTiming,
      setMaterial,
      ask,
      reset,
      loading,
      answer,
      active,
      applyPhotoAnswer,
    }),
    [query, context, ask, reset, loading, answer, active, setTiming, setMaterial, applyPhotoAnswer]
  );

  return <HeroAssistantContext.Provider value={value}>{children}</HeroAssistantContext.Provider>;
}

export function useHeroAssistant(): HeroAssistantValue {
  const value = useContext(HeroAssistantContext);
  if (!value) throw new Error("useHeroAssistant must be used within HeroAssistantProvider");
  return value;
}

/** Фото-подсказка в hero: рендерится только при NEXT_PUBLIC_PHOTO_BETA="1". */
export function HeroPhotoAssist() {
  const { applyPhotoAnswer, context } = useHeroAssistant();
  return <PhotoAssist onAnswer={applyPhotoAnswer} timing={context.timing} />;
}

// Карточка ответа тяжёлая (протоколы, чипы, ссылки) — грузим только при первом запросе,
// чтобы не влиять на LCP первого экрана.
const HeroAnswerCard = dynamic(() => import("@/components/home/HeroAnswerCard"), { ssr: false });

interface HeroAnswerSlotProps {
  /** Картинка hero — серверный children; показывается, пока ИИ не запрошен. */
  children: ReactNode;
}

/**
 * Правая колонка hero: без запроса — картинка, при запросе — ответ технолога в тех же габаритах
 * (без CLS). На мобильных карточка дополнительно рендерится под полем поиска.
 */
export function HeroAnswerSlot({ children }: HeroAnswerSlotProps) {
  const { active, loading, answer } = useHeroAssistant();
  const showAnswer = active || loading;

  return (
    <>
      <div className="relative hidden min-h-[340px] overflow-hidden bg-muted lg:block">
        <div className={showAnswer ? "hidden" : "absolute inset-0"}>{children}</div>
        {showAnswer && (
          <div className="absolute inset-0 overflow-y-auto p-5">
            <HeroAnswerCard />
          </div>
        )}
      </div>
      {showAnswer && (
        <div className="mt-4 lg:hidden">
          <HeroAnswerCard />
        </div>
      )}
    </>
  );
}

/** Кнопка закрытия ответа: возвращает hero к исходному виду (картинка + быстрые CTA). */
export function HeroAnswerClose() {
  const { reset } = useHeroAssistant();
  return (
    <button
      type="button"
      onClick={reset}
      aria-label="Закрыть ответ и вернуться к поиску"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-ink/40 hover:text-foreground"
    >
      <X className="h-4 w-4" aria-hidden />
    </button>
  );
}

/** Скринридер: «Технолог разбирает задачу…» / «Ответ готов». */
export function HeroAnswerStatus() {
  const { loading, answer, active } = useHeroAssistant();
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {active ? (loading ? "Анализирую запрос…" : answer ? "Ответ готов" : "") : ""}
    </p>
  );
}

/** Скелетон ожидания ответа. */
export function HeroAnswerSkeleton() {
  return (
    <div aria-hidden="true" className="glass rounded-panel p-5">
      <div className="flex items-center gap-2.5">
        <Loader2 className="h-4 w-4 animate-spin text-teal" />
        <p className="text-sm font-semibold text-foreground">Технолог разбирает задачу…</p>
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

