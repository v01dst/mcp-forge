import { describe, it, expect } from "vitest";
import { detectType } from "../src/forge/scraper.js";
describe("detectType", () => {
  it("detects openapi", () => { expect(detectType("https://x/openapi.json", '{"openapi":"3.0.0"}', "application/json")).toBe("openapi"); });
  it("detects llms", () => { expect(detectType("https://x/llms.txt", "# API", "text/plain")).toBe("llms"); });
  it("detects html fallback", () => { expect(detectType("https://x/docs", "<html>", "text/html")).toBe("html"); });
});
