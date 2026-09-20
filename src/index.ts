import { Server } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import fs from "node:fs/promises";
import { fetchSource } from "./forge/scraper.js";
import { generateTools } from "./forge/generator.js";
import type { ForgedTool } from "./forge/generator.js";
import { saveForged, listForged, storePath } from "./forge/store.js";
import { callForged } from "./forge/executor.js";

export const ForgeAddInput = z.object({ sourceUrl: z.string().url() });
export const ForgeCallInput = z.object({
  toolName: z.string().min(1),
  args: z.record(z.unknown()).optional().default({}),
});

export async function forge_add(sourceUrl: string): Promise<{ tools: string[] }> {
  const parsed = ForgeAddInput.parse({ sourceUrl });
  const { type, raw } = await fetchSource(parsed.sourceUrl);
  const tools: ForgedTool[] = generateTools(type, raw, parsed.sourceUrl);
  for (const t of tools) {
    await saveForged(t.name, t);
  }
  return { tools: tools.map((t) => t.name) };
}

export async function forge_list(): Promise<{ name: string; tokens: number }[]> {
  return listForged();
}

export async function forge_call(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<{ status: number; body: string; truncated: boolean }> {
  const parsed = ForgeCallInput.parse({ toolName, args });
  const raw = await fs.readFile(storePath(parsed.toolName), "utf8");
  const tool = JSON.parse(raw) as ForgedTool;
  return callForged(tool, (parsed.args ?? {}) as Record<string, unknown>);
}

const TOOL_DEFS = [
  {
    name: "forge_add",
    description: "Fetch a docs URL (OpenAPI / llms.txt / HTML) and forge lean callable tools from it. Returns {tools: names}.",
    inputSchema: {
      type: "object",
      properties: { sourceUrl: { type: "string", format: "uri" } },
      required: ["sourceUrl"],
    },
  },
  {
    name: "forge_list",
    description: "List forged tools in the local store.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "forge_call",
    description: "Call a forged tool by name with args. Loads tool JSON from store then executes with timeout + truncation.",
    inputSchema: {
      type: "object",
      properties: {
        toolName: { type: "string" },
        args: { type: "object" },
      },
      required: ["toolName"],
    },
  },
];

export function createServer(): Server {
  const server = new Server({ name: "mcp-forge", version: "0.2.0" }, { capabilities: { tools: {} } });

  (server as any).setRequestHandler("tools/list", async () => ({ tools: TOOL_DEFS }));

  (server as any).setRequestHandler("tools/call", async (request: any) => {
    const name = request?.params?.name as string;
    const rawArgs = (request?.params?.arguments ?? {}) as Record<string, unknown>;
    try {
      if (name === "forge_add") {
        const parsed = ForgeAddInput.parse(rawArgs);
        const result = await forge_add(parsed.sourceUrl);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
      if (name === "forge_list") {
        const result = await forge_list();
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
      if (name === "forge_call") {
        const parsed = ForgeCallInput.parse(rawArgs);
        const result = await forge_call(parsed.toolName, (parsed.args ?? {}) as Record<string, unknown>);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
      throw new Error(`Unknown tool ${name}`);
    } catch (e: any) {
      const code = e?.code ? ` [${e.code}]` : "";
      return {
        content: [{ type: "text", text: `${e?.message ?? String(e)}${code}` }],
        isError: true,
      };
    }
  });

  return server;
}

export async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
