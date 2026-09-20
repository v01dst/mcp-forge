import { describe, it, expect } from "vitest";
import { generateTools } from "../src/forge/generator.js";
const openapi = JSON.stringify({ openapi: "3.0.0", info: { title: "Demo" }, paths: { "/files/{id}": { get: { summary: "Get file with a very long description ".repeat(20), parameters: [{ name: "id", required: true }] } } } });
describe("generator", () => {
  it("prunes descriptions and caps tokens", () => {
    const tools = generateTools("openapi", openapi, "https://x/openapi.json");
    expect(tools.length).toBe(1);
    expect(tools[0].description.length).toBeLessThanOrEqual(200);
    expect(JSON.stringify(tools).length/4).toBeLessThan(2000);
  });

  it("caps 20-tool worst case under 2000 tokens", () => {
    const paths: Record<string, unknown> = {};
    for (let i = 0; i < 20; i++) {
      paths[`/res${i}/{id}`] = {
        get: {
          summary: "x".repeat(500),
          parameters: Array.from({ length: 20 }, (_, j) => ({ name: `p${j}_` + "y".repeat(30), required: true })),
        },
      };
    }
    const big = JSON.stringify({ openapi: "3.0.0", paths });
    const tools = generateTools("openapi", big, "https://x/openapi.json");
    expect(JSON.stringify(tools).length / 4).toBeLessThan(2000);
  });
});
