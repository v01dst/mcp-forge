# mcp-forge

Turn any docs URL into lean, callable MCP tools. No more pasting 1M-token API dumps into context.

## Install

```bash
npx mcp-forge
```

Requires Node >= 20.

## Claude config

Add to your Claude Desktop / Claude Code MCP config:

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

If installed globally, point `args` at your install path (e.g. `/path/to/mcp-forge/dist/index.js`). Then restart Claude.

## 30-sec demo

Point Forge at an OpenAPI URL, list what it forged, then call one:

```
forge_add({ "sourceUrl": "https://petstore3.swagger.io/api/v3/openapi.json" })
// -> { "tools": ["listPets", "getPetById", ...] }

forge_list()
// -> [{ "name": "listPets", "tokens": 312 }, ...]

forge_call({ "toolName": "getPetById", "args": { "petId": 1 } })
// -> { "status": 200, "body": "{...}", "truncated": false }
```

Works with OpenAPI / Swagger JSON, `llms.txt`, and plain HTML docs pages. Forged tools are saved to a local store and executed with timeout + truncation guards.

## Why: token table

Blog-era bloat vs. forged tools (per widely cited ecosystem reports — your mileage varies by API):

| Source | Tokens in context |
|---|---|
| Forge (per forged tool) | < 3K |
| GitHub API surface | ~45K |
| Cloudflare API surface | ~1.17M |

Forge fetches the docs once, extracts lean tool definitions (method + path + args), and only the small definition enters context — never the full spec.

*Token figures cite known ecosystem reports about MCP server token costs, not benchmarks run by this repo. No fake claims: measure your own API before quoting numbers.*

## Security notes

- **SSRF block:** private/loopback/link-local hosts and non-http(s) schemes are rejected before fetch.
- **15s timeout:** both docs fetch and forged-tool execution abort after 15 seconds (`AbortController`).
- **10KB truncate:** execution response bodies are cut at 10,240 chars with `truncated: true` — context never fills with a giant dump.
- **No secrets stored:** the local store holds only tool definitions (name, method, path, source URL). No API keys, tokens, or response bodies are persisted.

## License

MIT.
