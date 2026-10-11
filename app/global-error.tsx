"use client";

import { BRAND_COLORS } from "@/lib/site";

/** Последняя линия: ошибка в root layout. Без Tailwind и контекстов — стили инлайном. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: BRAND_COLORS.ink,
          color: BRAND_COLORS.paper,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div role="alert" style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Сайт временно недоступен</h1>
          <p style={{ color: BRAND_COLORS.muted, lineHeight: 1.6 }}>Мы уже знаем о сбое. Попробуйте обновить страницу.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 8,
              height: 48,
              padding: "0 24px",
              border: 0,
              borderRadius: 999,
              background: BRAND_COLORS.brand,
              color: BRAND_COLORS.brandForeground,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Повторить
          </button>
        </div>
      </body>
    </html>
  );
}
