import { describe, it, expect } from "vitest";
import { detectType, fetchSource } from "../src/forge/scraper.js";
describe("detectType", () => {
  it("detects openapi", () => { expect(detectType("https://x/openapi.json", '{"openapi":"3.0.0"}', "application/json")).toBe("openapi"); });
  it("detects llms", () => { expect(detectType("https://x/llms.txt", "# API", "text/plain")).toBe("llms"); });
  it("detects html fallback", () => { expect(detectType("https://x/docs", "<html>", "text/html")).toBe("html"); });
});

describe("fetchSource redirects", () => {
  it("stops after 3 redirects", async () => {
    let calls = 0;
    const doFetch = (async () => {
      calls++;
      return new Response(null, { status: 302, headers: { location: "https://x.example/next" } });
    }) as unknown as typeof fetch;
    await expect(fetchSource("https://x.example/start", doFetch)).rejects.toThrow(/too many redirects/);
    expect(calls).toBe(4);
  });
});
