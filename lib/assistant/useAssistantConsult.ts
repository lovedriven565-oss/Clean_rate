"use client";

import { useCallback, useState } from "react";
import { useRegion } from "@/components/providers/RegionProvider";
import { buildAssistantErrorAnswer, type AssistantAnswer, type AssistantContext } from "@/lib/assistant/engine";

export interface ConsultRequest {
  message: string;
  timing?: AssistantContext["timing"];
  material?: string;
  solutionSlug?: string;
}

export interface AssistantConsultState {
  answer: AssistantAnswer | null;
  loading: boolean;
  /** true только сразу после успешного/неуспешного ответа — для автоскролла полной панели. */
  received: boolean;
  consult: (request: ConsultRequest) => Promise<void>;
  /** Подставляет готовый ответ из другого сценария (например, фото-триажа). */
  applyAnswer: (answer: AssistantAnswer) => void;
}

/**
 * Общий вызов /api/assistant: используется полной панелью /assistant
 * и компактной карточкой в hero главной. countryCode берётся из региона.
 */
export function useAssistantConsult(): AssistantConsultState {
  const { countryCode } = useRegion();
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [received, setReceived] = useState(false);

  const consult = useCallback(
    async (request: ConsultRequest) => {
      const message = request.message.trim();
      if (message.length < 2) return;
      setLoading(true);
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            context: {
              timing: request.timing,
              material: request.material,
              solutionSlug: request.solutionSlug,
              countryCode,
            } satisfies AssistantContext,
          }),
        });
        if (!res.ok) throw new Error("assistant failed");
        setAnswer((await res.json()) as AssistantAnswer);
      } catch {
        setAnswer(buildAssistantErrorAnswer());
      } finally {
        setLoading(false);
        setReceived(true);
      }
    },
    [countryCode]
  );

  const applyAnswer = useCallback((next: AssistantAnswer) => {
    setAnswer(next);
    setLoading(false);
    setReceived(true);
  }, []);

  return { answer, loading, received, consult, applyAnswer };
}
