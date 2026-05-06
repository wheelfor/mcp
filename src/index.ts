import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API = "https://wheelfor.com/api";

const THEMES = [
  "Fresh Air",
  "Popcorn",
  "Playground",
  "Sprinkles",
  "Chalkboard",
  "Buddy System",
  "Garden Party",
  "Marshmallow",
] as const;

const server = new Server(
  { name: "wheelfor", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_wheel",
      description:
        "Create a shareable spinning decision wheel on wheelfor.com from a list of options",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Short title (e.g. 'Team Lunch Spots')" },
          choices: {
            type: "array",
            items: { type: "string" },
            description: "Items on the wheel",
          },
          description: { type: "string", description: "One sentence describing the wheel" },
          theme: {
            type: "string",
            enum: THEMES,
            description:
              "Visual theme — Fresh Air (nature), Popcorn (fun), Playground (bold), Sprinkles (celebration), Chalkboard (education), Buddy System (teams), Garden Party (elegant), Marshmallow (cozy)",
          },
          longDescription: {
            type: "string",
            description: "2–3 paragraphs on use cases (used for SEO)",
          },
          usageHint: {
            type: "string",
            description: "Brief instruction for visitors (e.g. 'Spin to pick a random lunch spot')",
          },
          choiceNounSingular: { type: "string", description: "Word for one choice (e.g. 'restaurant')" },
          choiceNounPlural: { type: "string", description: "Plural form (e.g. 'restaurants')" },
        },
        required: ["name", "choices", "description", "theme"],
      },
    },
    {
      name: "spin_wheel",
      description: "Spin an existing wheelfor.com wheel and get a random result with a shareable URL",
      inputSchema: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "Wheel slug or full URL (e.g. 'lunch-spots' or 'https://wheelfor.com/wheel/lunch-spots')",
          },
        },
        required: ["slug"],
      },
    },
    {
      name: "update_wheel",
      description: "Update an existing wheelfor.com wheel using its edit key",
      inputSchema: {
        type: "object",
        properties: {
          slug: { type: "string", description: "Wheel slug" },
          editKey: { type: "string", description: "Edit key from wheel creation" },
          name: { type: "string" },
          choices: { type: "array", items: { type: "string" } },
          theme: { type: "string", enum: THEMES },
          description: { type: "string" },
          longDescription: { type: "string" },
          usageHint: { type: "string" },
          choiceNounSingular: { type: "string" },
          choiceNounPlural: { type: "string" },
        },
        required: ["slug", "editKey"],
      },
    },
    {
      name: "decide",
      description:
        "Pick randomly from a list of options and create a shareable wheel on wheelfor.com in one step",
      inputSchema: {
        type: "object",
        properties: {
          options: {
            type: "array",
            items: { type: "string" },
            description: "Options to choose from",
          },
          topic: {
            type: "string",
            description: "What the decision is about (e.g. 'Lunch', 'Sprint activity')",
          },
        },
        required: ["options"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) throw new Error("Missing arguments");

  switch (name) {
    case "create_wheel": {
      const res = await fetch(`${API}/wheels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: args.name,
          choices: (args.choices as string[]).join("\n"),
          description: args.description,
          theme: args.theme,
          longDescription: args.longDescription ?? "",
          usageHint: args.usageHint ?? "",
          choiceNounSingular: args.choiceNounSingular ?? "option",
          choiceNounPlural: args.choiceNounPlural ?? "options",
        }),
      });
      const data = (await res.json()) as { success: boolean; slug: string; editKey: string; error?: string };
      if (!data.success) throw new Error(data.error ?? "Failed to create wheel");
      return {
        content: [
          {
            type: "text",
            text: `Wheel created: https://wheelfor.com/wheel/${data.slug}\nEdit key: ${data.editKey}`,
          },
        ],
      };
    }

    case "spin_wheel": {
      const raw = args.slug as string;
      const slug = raw.replace(/^https?:\/\/[^/]+\/wheel\//, "").replace(/\/.*$/, "");
      const res = await fetch(`${API}/wheels/${slug}/spin`);
      const data = (await res.json()) as { result: string; url: string };
      return {
        content: [
          {
            type: "text",
            text: `The wheel landed on: **${data.result}**\nShare: ${data.url}`,
          },
        ],
      };
    }

    case "update_wheel": {
      const body: Record<string, unknown> = {
        wheelId: args.slug,
        editKey: args.editKey,
      };
      if (args.name) body.name = args.name;
      if (args.choices) body.choices = (args.choices as string[]).join("\n");
      if (args.theme) body.theme = args.theme;
      if (args.description) body.description = args.description;
      if (args.longDescription) body.longDescription = args.longDescription;
      if (args.usageHint) body.usageHint = args.usageHint;
      if (args.choiceNounSingular) body.choiceNounSingular = args.choiceNounSingular;
      if (args.choiceNounPlural) body.choiceNounPlural = args.choiceNounPlural;

      const res = await fetch(`${API}/wheels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { success: boolean; slug: string; error?: string };
      if (!data.success) throw new Error(data.error ?? "Failed to update wheel");
      return {
        content: [
          {
            type: "text",
            text: `Wheel updated: https://wheelfor.com/wheel/${data.slug}`,
          },
        ],
      };
    }

    case "decide": {
      const options = args.options as string[];
      const picked = options[Math.floor(Math.random() * options.length)];
      const topic = (args.topic as string | undefined) ?? "Decision";

      const res = await fetch(`${API}/wheels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: topic,
          choices: options.join("\n"),
          description: `Random picker for ${topic.toLowerCase()}`,
          theme: "Popcorn",
          longDescription: "",
          usageHint: "Spin to pick randomly",
          choiceNounSingular: "option",
          choiceNounPlural: "options",
        }),
      });
      const data = (await res.json()) as { success: boolean; slug: string; editKey: string };

      let text = `Picked: **${picked}**`;
      if (data.success) {
        text += `\nSpin again: https://wheelfor.com/wheel/${data.slug}\nEdit key: ${data.editKey}`;
      }
      return { content: [{ type: "text", text }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
