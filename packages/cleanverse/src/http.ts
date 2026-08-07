import type { CvEnvelope, CvResult, Provenance } from "./types.js";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Stable business errors must not be retried — the answer won't change. */
function isStableError(message: string): boolean {
  return /not found|CN_\d+|already exists|invalid|incorrect|format|must be|cannot be null|parameter|too frequent|NoAPass/i.test(
    message,
  );
}

function isTransient(body: { code?: string; message?: string }): boolean {
  return body.code !== "0000" && !isStableError(body.message ?? "");
}

export interface HttpOptions {
  headers?: Record<string, string>;
  /** Reads retry transient sandbox errors; writes never retry. */
  retry?: boolean;
  timeoutMs?: number;
}

/**
 * POST JSON to a Cleanverse surface with transient-error retry and a hard timeout.
 * Returns the parsed envelope tagged with its provenance.
 */
export async function postJson<T>(
  url: string,
  payload: unknown,
  opts: HttpOptions = {},
  source: Provenance = "live",
): Promise<CvResult<T>> {
  const attempts = opts.retry ? 3 : 1;
  let last: CvEnvelope<T> | undefined;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await delay(250 * i);
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), opts.timeoutMs ?? 15_000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...opts.headers },
        body: JSON.stringify(payload ?? {}),
        signal: ac.signal,
      });
      last = (await res.json()) as CvEnvelope<T>;
      if (res.ok && !isTransient(last)) return { ...last, source };
    } catch (err) {
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
  }
  if (last) return { ...last, source };
  throw new Error(`cleanverse request failed after ${attempts} attempt(s): ${String(lastErr)}`);
}
