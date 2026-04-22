import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  Type,
  type Content,
  type FunctionCall,
  type FunctionDeclaration,
} from '@google/genai';
import type { Persona } from './neon';
import type { SandboxHandle } from './sandbox';
import { type AssetManifestEntry } from './storage';

export interface AgentContext {
  sandbox: SandboxHandle;
  persona: Persona;
  systemPrompt: string;
  taskPrompt: string;
  assets: AssetManifestEntry[];
  assetsPublicUrl: string;
  apiKey: string;
  onStep: (step: string) => void;
}

export interface AgentResult {
  html: string;
  transcript: string;
  iterations: number;
  usedFallback: boolean;
  tokenUsage: number;
}

const GEMINI_MODEL = 'gemini-3-flash-preview';
const MAX_ITERATIONS = 6;

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'list_assets',
    description: 'List available Y2K assets filtered by tags. Returns { key, kind, tags } rows.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['tags'],
    },
  },
  {
    name: 'write_file',
    description: 'Write a file inside the sandbox workspace (e.g. /workspace/index.html).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: { type: Type.STRING },
        content: { type: Type.STRING },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'read_file',
    description: 'Read a file you previously wrote.',
    parameters: {
      type: Type.OBJECT,
      properties: { path: { type: Type.STRING } },
      required: ['path'],
    },
  },
  {
    name: 'validate_html',
    description: 'Run tidy on /workspace/index.html. Returns the first 20 warning/error lines.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'done',
    description: 'Submit the final page. Call this when /workspace/index.html is good.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
];

export async function runCodingAgent(ctx: AgentContext): Promise<AgentResult> {
  const ai = new GoogleGenAI({ apiKey: ctx.apiKey });

  const systemInstruction = renderPrompt(ctx.systemPrompt, ctx);
  const userPrompt = renderPrompt(ctx.taskPrompt, ctx);

  const contents: Content[] = [{ role: 'user', parts: [{ text: userPrompt }] }];
  const transcript: string[] = [`SYSTEM:\n${systemInstruction}`, `USER:\n${userPrompt}`];
  let tokenUsage = 0;

  let iterationsUsed = 0;
  let sawWriteFile = false;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    iterationsUsed = i + 1;
    transcript.push(`\n--- ITERATION ${i + 1} ---`);
    ctx.onStep(`iteration-${i + 1}`);

    // Mid-loop nudge: if the agent has spent 2 turns exploring without
    // writing, insert a user reminder to commit to a write_file call.
    if (i === 3 && !sawWriteFile) {
      const reminder =
        'STOP calling list_assets. You have seen enough. On your next turn, call write_file with the COMPLETE HTML for /workspace/index.html — use the assets you already have. If a tag returned no results, improvise. The page needs tables, marquee, background, Comic Sans, a fake hit counter, and a last-updated date 1998-2001.';
      contents.push({ role: 'user', parts: [{ text: reminder }] });
      transcript.push(`REMINDER INJECTED: ${reminder}`);
    }
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: TOOLS }],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
        },
      },
    });

    tokenUsage += response.usageMetadata?.totalTokenCount ?? 0;

    const calls: FunctionCall[] = response.functionCalls ?? [];
    if (calls.length === 0) {
      transcript.push(`MODEL (iter ${i}): no function call, text=${response.text ?? ''}`);
      break;
    }

    // Echo the model's full content back verbatim — Gemini 3 requires
    // `thoughtSignature` to round-trip with every function call, so we
    // can't reconstruct from `functionCalls` alone.
    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) {
      contents.push(modelContent);
    } else {
      contents.push({
        role: 'model',
        parts: calls.map((c) => ({ functionCall: c })),
      });
    }

    const responseParts: Content['parts'] = [];
    let sawDone = false;
    for (const call of calls) {
      transcript.push(`TOOL CALL: ${call.name} ${JSON.stringify(call.args ?? {}).slice(0, 200)}`);
      if (call.name === 'done') {
        sawDone = true;
        break;
      }
      if (call.name === 'write_file') sawWriteFile = true;
      const result = await executeTool(ctx, call);
      transcript.push(`TOOL RESULT: ${JSON.stringify(result).slice(0, 400)}`);
      responseParts.push({
        functionResponse: {
          name: call.name!,
          response: result as Record<string, unknown>,
        },
      });
    }

    if (sawDone) break;

    if (responseParts && responseParts.length > 0) {
      contents.push({ role: 'user', parts: responseParts });
    }
  }

  let html: string;
  let usedFallback = false;
  try {
    html = await ctx.sandbox.readFile('/workspace/index.html');
  } catch {
    html = fallbackTemplate(ctx);
    usedFallback = true;
    transcript.push('FALLBACK: agent never wrote /workspace/index.html');
  }

  return {
    html,
    transcript: transcript.join('\n\n').slice(0, 20_000),
    iterations: iterationsUsed,
    usedFallback,
    tokenUsage,
  };
}

/**
 * Demo-safe deterministic template. Triggered when GEMINI_API_KEY is
 * empty, or when the agent loop throws (project.md §17 fallback row).
 */
export function fallbackTemplate(ctx: {
  persona: Persona;
  assets: AssetManifestEntry[];
  assetsPublicUrl: string;
}): string {
  const { persona, assets, assetsPublicUrl } = ctx;
  const tile = assets.find((a) => a.kind === 'tile');
  const gif = assets.find((a) => a.kind === 'gif');
  const tileUrl = tile ? `${assetsPublicUrl}/${tile.key}` : '';
  const gifTag = gif ? `<img src="${assetsPublicUrl}/${gif.key}" alt="">` : '';
  const palette = persona.palette;
  const date = persona.era
    .replace('-Q1', '-03-01')
    .replace('-Q2', '-06-01')
    .replace('-Q3', '-09-01')
    .replace('-Q4', '-12-01');

  const rules = [
    `i am ${persona.age} years old`,
    `i love ${persona.obsessions.slice(0, 3).join(', ')}`,
    'thanks 4 visiting!!',
  ].join(' &middot; ');

  return `<!DOCTYPE html>
<html>
<head>
<title>${escapeHtml(persona.name)}'s Homepage</title>
<style>
  body { font-family: "Comic Sans MS", cursive; ${tileUrl ? `background-image: url('${tileUrl}');` : ''} color: ${palette.fg}; background-color: ${palette.bg}; }
  @keyframes blinker { 50% { opacity: 0; } }
  .blink { animation: blinker 1s step-start infinite; font-weight: bold; }
  marquee { font-family: "Impact"; color: ${palette.link ?? palette.fg}; }
</style>
</head>
<body bgcolor="${palette.bg}" text="${palette.fg}" link="${palette.link ?? palette.fg}" vlink="${palette.vlink ?? palette.fg}"${tileUrl ? ` background="${tileUrl}"` : ''}>
<center>
<marquee behavior="scroll" direction="left" scrollamount="6">*** WELCOME TO ${escapeHtml(persona.name.toUpperCase())}'S HOMEPAGE *** last updated ${date} *** ${escapeHtml(persona.obsessions[0] ?? 'the web')} 4 LIFE ***</marquee>
<table border="0" cellpadding="12" cellspacing="0" width="760">
<tr><td align="center">
  <font face="Impact" size="7" color="${palette.fg}">${escapeHtml(persona.name.toUpperCase())}'S PAGE</font>
</td></tr>
<tr><td align="center">${gifTag}</td></tr>
<tr><td align="center">
  <font face="Comic Sans MS" size="4">
    hi my name is ${escapeHtml(persona.name)}.<br>
    ${escapeHtml(rules)}<br>
    <span class="blink">!!! UNDER CONSTRUCTION !!!</span>
  </font>
</td></tr>
<tr><td align="center">
  <font face="Courier" color="${palette.link ?? palette.fg}">Visitors: 00042</font><br>
  <font face="Arial Black" size="2">last updated: ${date}</font>
</td></tr>
</table>
</center>
</body>
</html>`;
}

async function executeTool(
  ctx: AgentContext,
  call: FunctionCall,
): Promise<Record<string, unknown>> {
  const args = (call.args ?? {}) as Record<string, unknown>;
  switch (call.name) {
    case 'list_assets': {
      const tags = Array.isArray(args.tags) ? (args.tags as string[]) : [];
      const matched = ctx.assets
        .filter((a) => tags.length === 0 || a.tags.some((t) => tags.includes(t)))
        .slice(0, 30);
      return { assets: matched };
    }
    case 'write_file': {
      const { path, content } = args as { path?: string; content?: string };
      if (!path || typeof content !== 'string') return { error: 'missing path/content' };
      await ctx.sandbox.writeFile(path, content);
      return { ok: true, bytes: content.length };
    }
    case 'read_file': {
      const { path } = args as { path?: string };
      if (!path) return { error: 'missing path' };
      try {
        const content = await ctx.sandbox.readFile(path);
        return { content: content.slice(0, 8000) };
      } catch (err) {
        return { error: (err as Error).message };
      }
    }
    case 'validate_html': {
      const res = await ctx.sandbox.exec(
        '/usr/bin/tidy -errors -q /workspace/index.html 2>&1 | head -20 || true',
      );
      return { output: res.stdout.slice(0, 2000) };
    }
    default:
      return { error: `unknown tool ${call.name}` };
  }
}

function renderPrompt(template: string, ctx: AgentContext): string {
  return template
    .replace(/\{\{name\}\}/g, ctx.persona.name)
    .replace(/\{\{age\}\}/g, String(ctx.persona.age))
    .replace(/\{\{era\}\}/g, ctx.persona.era)
    .replace(/\{\{obsessions\}\}/g, ctx.persona.obsessions.join(', '))
    .replace(/\{\{palette\}\}/g, JSON.stringify(ctx.persona.palette))
    .replace(/\{\{vibe_notes\}\}/g, ctx.persona.vibe_notes)
    .replace(/\{\{assets_public_url\}\}/g, ctx.assetsPublicUrl);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
