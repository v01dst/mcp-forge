import type { ForgedTool } from "./generator.js";

const MAX_BODY = 10240;
const TIMEOUT_MS = 15000;

export interface ForgedResult {
  status: number;
  body: string;
  truncated: boolean;
}

export async function callForged(
  tool: ForgedTool,
  args: Record<string, unknown> = {},
  doFetch: typeof fetch = fetch
): Promise<ForgedResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let urlStr: string;
    if (tool.path.startsWith("http://") || tool.path.startsWith("https://")) {
      urlStr = tool.path;
    } else {
      urlStr = new URL(tool.path, tool.sourceUrl).toString();
    }
    for (const [k, v] of Object.entries(args)) {
      const placeholder = `{${k}}`;
      if (urlStr.includes(placeholder)) {
        urlStr = urlStr.replaceAll(placeholder, encodeURIComponent(String(v)));
      }
    }
    const url = new URL(urlStr);
    const method = tool.method.toUpperCase();
    const init: RequestInit = { method, signal: ctrl.signal };
    if (method === "GET") {
      for (const [k, v] of Object.entries(args)) {
        if (urlStr.includes(`{${k}}`)) continue;
        if (v === undefined || v === null) continue;
        url.searchParams.append(k, String(v));
      }
    } else {
      init.headers = { "content-type": "application/json" };
      init.body = JSON.stringify(args ?? {});
    }
    let res: Response;
    try {
      res = await doFetch(url.toString(), init);
    } catch (e: any) {
      if (e?.name === "AbortError") {
        throw Object.assign(new Error("exec timeout"), { code: "EXEC_FAILED" });
      }
      throw Object.assign(new Error(String(e?.message ?? e)), { code: "EXEC_FAILED" });
    }
    if (!res.ok) {
      throw Object.assign(new Error(`exec failed: ${res.status}`), { code: "EXEC_FAILED" });
    }
    let text = await res.text();
    let truncated = false;
    if (text.length > MAX_BODY) {
      text = text.slice(0, MAX_BODY);
      truncated = true;
    }
    return { status: res.status, body: text, truncated };
  } catch (e: any) {
    if (e?.code) throw e;
    if (e?.name === "AbortError") {
      throw Object.assign(new Error("exec timeout"), { code: "EXEC_FAILED" });
    }
    throw Object.assign(new Error(String(e?.message ?? e)), { code: "EXEC_FAILED" });
  } finally {
    clearTimeout(timer);
  }
}
