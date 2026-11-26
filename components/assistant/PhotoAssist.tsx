"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackEvent } from "@/lib/analytics";
import type { AssistantAnswer, AssistantTiming } from "@/lib/assistant/engine";
import { cn } from "@/lib/utils";

/** Публичный флаг беты: без NEXT_PUBLIC_PHOTO_BETA="1" секция не рендерится. */
const PHOTO_BETA_ENABLED = process.env.NEXT_PUBLIC_PHOTO_BETA === "1";

const CLIENT_MAX_BYTES = 5 * 1024 * 1024;
const CLIENT_MAX_DIMENSION = 1600;
const ACCEPT = "image/jpeg,image/png,image/webp";

const MATERIAL_OPTIONS = [
  { value: "", label: "Материал не знаю" },
  { value: "Велюр / ткань", label: "Велюр / ткань" },
  { value: "Кожа / замша", label: "Кожа / замша" },
  { value: "Ламинат / паркет", label: "Ламинат / паркет" },
  { value: "Плитка / камень", label: "Плитка / камень" },
  { value: "Стекло / хром", label: "Стекло / хром" },
  { value: "Сантехника", label: "Сантехника" },
] as const;

type Stage = "collapsed" | "notice" | "form";

interface PhotoAssistProps {
  /** Ответ серверного триажа — родитель подставляет в общий рендер ответа. */
  onAnswer: (answer: AssistantAnswer) => void;
  /** Контекст триажа из родителя (состояние пятна), если уже выбран. */
  timing?: AssistantTiming;
}

/**
 * Компактная фото-подсказка (бета): два шага — сначала уведомление об
 * обработке, потом загрузка. Клиент сжимает и перекодирует кадр
 * (EXIF/метаданные теряются при canvas-перерисовке), сервер проверяет
 * сигнатуру и размеры. Без публичного флага компонент не рендерится.
 */
export function PhotoAssist({ onAnswer, timing }: PhotoAssistProps) {
  const { countryCode } = useRegion();
  const [stage, setStage] = useState<Stage>("collapsed");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [material, setMaterial] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => {
    if (stage === "collapsed") {
      trackEvent({
        entityType: "page",
        entityId: "/",
        eventType: "view",
        metadata: { placement: "assistant.photo", step: "open" },
      });
    }
    setStage((s) => (s === "collapsed" ? "notice" : s));
  }, [stage]);

  const pickFile = useCallback(
    (selected: File | null) => {
      setError(null);
      if (!selected) return;
      if (!ACCEPT.split(",").includes(selected.type)) {
        setError("Поддерживаются только JPG, PNG и WebP.");
        return;
      }
      if (selected.size > CLIENT_MAX_BYTES) {
        setError("Файл больше 5 МБ — сделайте снимок ближе или обрежьте его.");
        return;
      }
      setFile(selected);
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(selected);
      });
      setStage("form");
    },
    []
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  /** Перекодирование через canvas: уменьшает до 1600px и стирает EXIF. */
  const prepareBlob = useCallback(async (source: File): Promise<Blob> => {
    const bitmap = await createImageBitmap(source);
    const scale = Math.min(1, CLIENT_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob || blob.size === 0) throw new Error("encode_failed");
    return blob;
  }, []);

  const submit = useCallback(async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await prepareBlob(file);
      const formData = new FormData();
      formData.append("photo", new File([blob], "stain.jpg", { type: "image/jpeg" }));
      if (material) formData.append("material", material);
      if (timing) formData.append("timing", timing);
      if (turnstileToken) formData.append("turnstileToken", turnstileToken);
      formData.append("countryCode", countryCode);

      const res = await fetch("/api/assistant/photo", { method: "POST", body: formData });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; answer: AssistantAnswer }
        | { ok: false; error?: string }
        | null;

      if (res.ok && data && "answer" in data) {
        onAnswer(data.answer);
        clearFile();
        setStage("collapsed");
        return;
      }
      const code = !res.ok && data && "error" in data ? data.error : "unknown";
      setError(
        code === "daily_budget_exhausted"
          ? "Дневной лимит фото-разборов исчерпан — попробуйте завтра или опишите задачу словами."
          : code === "too_many_requests"
            ? "Слишком много запросов — подождите минуту."
            : code === "bot_check_failed"
              ? "Не удалось подтвердить, что вы не робот — обновите проверку и попробуйте ещё раз."
              : code === "unsupported_image"
                ? "Не удалось прочитать фото — попробуйте другой снимок (JPG/PNG/WebP)."
                : "Фото-разбор временно недоступен — опишите задачу словами, текстовый технолог работает."
      );
    } catch {
      setError("Не удалось обработать фото — опишите задачу словами.");
    } finally {
      setLoading(false);
    }
  }, [file, loading, prepareBlob, material, timing, turnstileToken, countryCode, onAnswer, clearFile]);

  if (!PHOTO_BETA_ENABLED) return null;

  return (
    <div className="rounded-control border border-dashed border-teal/30 bg-teal/5 p-3.5">
      {stage === "collapsed" && (
        <button
          type="button"
          onClick={open}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal transition-colors hover:text-foreground"
        >
          <Camera className="h-4 w-4" aria-hidden />
          Есть фото загрязнения? Разобрать по снимку
          <span className="rounded-full border border-teal/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            бета
          </span>
        </button>
      )}

      {stage === "notice" && (
        <div className="space-y-3">
          <p className="flex items-start gap-2 text-xs leading-5 text-foreground/90">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            Фото уйдёт провайдеру ИИ только для разбора и не сохраняется на ChistoLab.
            Не загружайте документы, лица и личные вещи — для них есть текстовый сценарий.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setStage("form");
                inputRef.current?.click();
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-lime px-4 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden />
              Понятно, выбрать фото
            </button>
            <button
              type="button"
              onClick={() => setStage("collapsed")}
              className="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {stage === "form" && (
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            aria-label="Выбрать фото загрязнения"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="flex items-center gap-3">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- локальный objectURL превью
                <img
                  src={previewUrl}
                  alt="Предпросмотр выбранного фото"
                  className="h-14 w-14 shrink-0 rounded-control border border-border object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{file.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} КБ · будет сжато перед отправкой
                </p>
              </div>
              <button
                type="button"
                onClick={clearFile}
                aria-label="Удалить выбранное фото"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-teal/40 bg-card/60 text-xs font-semibold text-teal transition-colors hover:border-teal/60"
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden />
              Выбрать фото (JPG, PNG, WebP до 5 МБ)
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="photo-material" className="text-xs font-medium text-muted-foreground">
              Покрытие:
            </label>
            <select
              id="photo-material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="h-9 rounded-full border border-border bg-card px-3 text-xs text-foreground"
            >
              {MATERIAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <TurnstileWidget onToken={setTurnstileToken} />

          {error && (
            <p role="alert" className="text-xs leading-5 text-danger">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!file || loading}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-xs font-semibold text-ink-foreground transition-transform",
                "hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Camera className="h-3.5 w-3.5" aria-hidden />}
              {loading ? "Разбираю фото…" : "Разобрать фото"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("collapsed");
                setError(null);
              }}
              className="inline-flex h-10 items-center rounded-full border border-border px-4 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
