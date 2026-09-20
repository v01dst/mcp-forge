import type { SourceType } from "./scraper.js";
export interface ForgedTool { name: string; description: string; method: string; path: string; params: {name:string;required:boolean}[]; sourceUrl: string; }
function prune(s: string): string { return s.replace(/\s+/g, " ").trim().slice(0, 200); }
export function generateTools(type: SourceType, raw: string, sourceUrl: string): ForgedTool[] {
  if (type === "openapi") {
    const doc = JSON.parse(raw);
    const paths = doc?.paths ?? {};
    const out: ForgedTool[] = [];
    for (const [p, methods] of Object.entries<any>(paths).slice(0, 20)) {
      if (out.length >= 20) break;
      for (const [m, op] of Object.entries<any>(methods as any).slice(0, 3)) {
        const name = `${m}_${p}`.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
        out.push({ name, description: prune(String(op?.summary ?? op?.description ?? `${m.toUpperCase()} ${p}`)), method: m.toUpperCase(), path: p, params: ((op?.parameters ?? []) as any[]).slice(0, 20).map(x => ({ name: String(x?.name), required: !!x?.required })), sourceUrl });
        if (out.length >= 20) break;
      }
    }
    if (!out.length) throw Object.assign(new Error("no paths"), { code: "UNSUPPORTED_TYPE", hint: "OpenAPI has no paths" });
    while (out.length > 1 && JSON.stringify(out).length / 4 > 2000) out.pop();
    return out;
  }
  if (type === "llms") {
    const lines = raw.split("\n").filter(l => l.trim().startsWith("-") || l.trim().startsWith("#")).slice(0, 20);
    if (!lines.length) throw Object.assign(new Error("empty llms"), { code: "UNSUPPORTED_TYPE", hint: "llms.txt unreadable" });
    return lines.map((l, i) => ({ name: `doc_section_${i}`, description: prune(l), method: "GET", path: sourceUrl, params: [], sourceUrl }));
  }
  const title = (raw.match(/<title>(.*?)<\/title>/i)?.[1] ?? "docs").slice(0, 80);
  return [{ name: "fetch_docs", description: prune(`Fetch docs: ${title}`), method: "GET", path: sourceUrl, params: [], sourceUrl }];
}
