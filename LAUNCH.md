# LAUNCH.md — mcp-forge manual launch checklist

Do every step by hand. No automation, no spam, no fake stars.

## 1. GitHub new repo

- [ ] Create a new public repo at github.com/new named `mcp-forge` (owner: you).
- [ ] Do NOT add README/LICENSE/.gitignore from the web UI (repo already has them locally).
- [ ] Push from `/root/mcp-forge` manually when ready (maintainer runs git commands).
- [ ] Confirm the README renders: title, install line, Claude snippet, demo, token table, security notes.

## 2. Topics / tags

- [ ] On the repo main page → About (gear icon) → Topics, add:
  - `mcp`
  - `modelcontextprotocol`
  - `typescript`
- [ ] Verify topics are saved and visible.

## 3. 30-sec GIF instruction

- [ ] Start the server locally (`npm run build && node dist/index.js` or via Claude).
- [ ] Record ≤30 seconds: `forge_add` with an OpenAPI URL → `forge_list` → `forge_call`.
- [ ] Keep the GIF under ~5 MB, no API keys or private URLs on screen.
- [ ] Upload the GIF into the repo README or a GitHub Release (manual upload only).

## 4. Post drafts (DRAFT — require user OK before posting)

### X (DRAFT — do not post without user OK)

> Turn any docs URL into lean MCP tools with mcp-forge.
> npx mcp-forge — forge_add → forge_list → forge_call.
> <3K tokens/tool instead of 45K–1.17M spec dumps. MIT. [repo link]

### Reddit (DRAFT — do not post without user OK)

> Title: mcp-forge: turn a docs URL into lean MCP tools
>
> Body (draft): I built a small MCP server that fetches a docs URL (OpenAPI / llms.txt / HTML) and forges lean callable tools from it. Three tools: forge_add, forge_list, forge_call. Guards: SSRF block, 15s timeout, 10KB truncation, no secrets stored. `npx mcp-forge`, MIT licensed. Happy to take feedback — [repo link].

### DEV (DRAFT — do not post without user OK)

> Title: Stop pasting API docs into context — forge them instead
>
> Draft outline: 1) the token problem (citing ecosystem reports, not our benchmarks), 2) 30-sec petstore demo, 3) Claude config snippet, 4) security guards, 5) repo link + MIT. Needs human review before publishing.

## Explicit NOs

- NO automation: do not auto-create repos, auto-push, auto-post, or auto-DM.
- NO spam: one relevant post per platform max, only where self-promo is allowed.
- NO fake stars: never buy, bot, or solicit stars/follows.
