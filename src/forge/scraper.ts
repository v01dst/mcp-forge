import { isBlockedUrl } from "./store.js";
export type SourceType = "openapi"|"llms"|"html";
export function detectType(url: string, body: string, contentType: string): SourceType {
  if (url.endsWith("llms.txt") || body.startsWith("# ")) return "llms";
  const t = body.trimStart();
  if ((t.startsWith("{") && t.includes('"openapi"')) || contentType.includes("openapi")) return "openapi";
  if (t.startsWith("{") && (t.includes('"paths"') || t.includes('"swagger"'))) return "openapi";
  return "html";
}
export async function fetchSource(url: string): Promise<{type: SourceType, raw: string, contentType: string}> {
  if (isBlockedUrl(url)) throw Object.assign(new Error("blocked url"), { code: "INVALID_SOURCE", hint: "http/https public URLs only" });
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) throw Object.assign(new Error(`fetch ${res.status}`), { code: "INVALID_SOURCE", hint: "check URL is public" });
    const ct = res.headers.get("content-type") ?? "";
    const raw = (await res.text()).slice(0, 500_000);
    return { type: detectType(url, raw, ct), raw, contentType: ct };
  } catch (e: any) {
    if (e?.name === "AbortError") throw Object.assign(new Error("timeout"), { code: "FETCH_TIMEOUT", hint: "retry or use smaller docs URL" });
    throw e?.code ? e : Object.assign(new Error(String(e)), { code: "INVALID_SOURCE", hint: "fetch failed" });
  } finally { clearTimeout(to); }
}
