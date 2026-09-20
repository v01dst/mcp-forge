import { describe, it, expect } from "vitest";
import { callForged } from "../src/forge/executor.js";
import type { ForgedTool } from "../src/forge/generator.js";

const tool: ForgedTool = {
  name: "get_file",
  description: "Get file",
  method: "GET",
  path: "/files/123",
  params: [],
  sourceUrl: "https://api.example.com/openapi.json",
};

describe("executor", () => {
  it("truncates 50K -> <=10240", async () => {
    const big = "x".repeat(50_000);
    const doFetch = (async () =>
      new Response(big, { status: 200 })) as unknown as typeof fetch;
    const out = await callForged(tool, {}, doFetch);
    expect(out.body.length).toBeLessThanOrEqual(10240);
    expect(out.truncated).toBe(true);
  });

  it("maps fetch failure to EXEC_FAILED", async () => {
    const doFetch = (async () => {
      throw new Error("boom");
    }) as unknown as typeof fetch;
    await expect(callForged(tool, {}, doFetch)).rejects.toMatchObject({ code: "EXEC_FAILED" });
  });
});
