export function parseApiResult(value: unknown) {
  if (typeof value !== "object" || value === null) return { ok: false, error: undefined };
  const record = value as Record<string, unknown>;
  return {
    ok: record.ok === true,
    error: typeof record.error === "string" ? record.error : undefined,
  };
}
