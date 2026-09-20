import { describe, it, expect } from "vitest";
import { safeName, isBlockedUrl } from "../src/forge/store.js";
describe("store", () => {
  it("sanitizes name", () => { expect(safeName("Figma API!!")).toBe("figma-api"); });
  it("blocks SSRF", () => {
    expect(isBlockedUrl("http://169.254.169.254/latest")).toBe(true);
    expect(isBlockedUrl("http://localhost:3000/x")).toBe(true);
    expect(isBlockedUrl("https://api.figma.com/v1/files")).toBe(false);
  });
});
