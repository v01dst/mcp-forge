import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
export function safeName(input: string): string {
  const s = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return s || "unnamed";
}
export function storeDir(): string { return path.join(os.homedir(), ".forge"); }
export function storePath(name: string): string { return path.join(storeDir(), `${safeName(name)}.json`); }
const BLOCKED = ["localhost", "127.0.0.1", "169.254.169.254", "metadata.google.internal"];
export function isBlockedUrl(u: string): boolean {
  try {
    const url = new URL(u);
    if (url.protocol !== "http:" && url.protocol !== "https:") return true;
    return BLOCKED.some(h => url.hostname === h || url.hostname.endsWith(`.${h}`));
  } catch { return true; }
}
export async function saveForged(name: string, data: object): Promise<string> {
  await fs.mkdir(storeDir(), { recursive: true });
  const p = storePath(name);
  await fs.writeFile(p, JSON.stringify(data, null, 2));
  return p;
}
export async function listForged(): Promise<{name:string,tokens:number}[]> {
  try {
    const files = await fs.readdir(storeDir());
    const out: {name:string,tokens:number}[] = [];
    for (const f of files.filter(f=>f.endsWith(".json"))) {
      const raw = await fs.readFile(path.join(storeDir(), f), "utf8");
      out.push({ name: f.replace(/\.json$/, ""), tokens: Math.ceil(raw.length/4) });
    }
    return out;
  } catch { return []; }
}
