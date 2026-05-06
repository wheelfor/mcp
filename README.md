# @wheelfor/mcp

MCP server for [wheelfor.com](https://wheelfor.com) — create, spin, and manage shareable decision wheels from any MCP-compatible AI client.

Works with Claude Desktop, Cursor, Windsurf, VS Code, and any other MCP host. No account required.

## Tools

| Tool | Description |
|------|-------------|
| `create_wheel` | Create a new spinning wheel from a list of options |
| `spin_wheel` | Spin an existing wheel and get a random result with a shareable URL |
| `update_wheel` | Update a wheel's choices, name, or theme using its edit key |
| `decide` | Pick randomly from a list and create a permanent wheel in one step |

## Installation

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wheelfor": {
      "command": "npx",
      "args": ["-y", "@wheelfor/mcp"]
    }
  }
}
```

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### Cursor

Add to `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "wheelfor": {
      "command": "npx",
      "args": ["-y", "@wheelfor/mcp"]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "wheelfor": {
      "command": "npx",
      "args": ["-y", "@wheelfor/mcp"]
    }
  }
}
```

## Usage

Once connected, ask your AI assistant:

- *"I can't decide between React, Vue, or Svelte — pick one"*
- *"Create a wheel for our team retro: Start, Stop, Continue, More Of, Less Of"*
- *"Spin wheelfor.com/wheel/lunch-spots"*
- *"Add burgers to my lunch-spots wheel"* (requires edit key from creation)

## Tool Reference

### `create_wheel`

Creates a new wheel on wheelfor.com.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✓ | Short title |
| `choices` | string[] | ✓ | Items on the wheel |
| `description` | string | ✓ | One sentence describing the wheel |
| `theme` | string | ✓ | Visual theme (see below) |
| `longDescription` | string | | 2–3 paragraphs on use cases |
| `usageHint` | string | | Brief instruction for visitors |
| `choiceNounSingular` | string | | Word for one choice (e.g. `"restaurant"`) |
| `choiceNounPlural` | string | | Plural form (e.g. `"restaurants"`) |

**Themes:** `Fresh Air` · `Popcorn` · `Playground` · `Sprinkles` · `Chalkboard` · `Buddy System` · `Garden Party` · `Marshmallow`

Returns the wheel URL and an edit key for future updates.

### `spin_wheel`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✓ | Wheel slug or full URL |

Returns the winning choice and a shareable result URL.

### `update_wheel`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✓ | Wheel slug |
| `editKey` | string | ✓ | Edit key from creation |
| `name` | string | | New title |
| `choices` | string[] | | New choices list |
| `theme` | string | | New theme |
| `description` | string | | New description |

### `decide`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options` | string[] | ✓ | Options to choose from |
| `topic` | string | | What the decision is about |

Picks a random option immediately, then creates a permanent wheel for future spins.

## License

MIT
