import { OLLAMA_BASE_URL, OLLAMA_MODEL, IQAI_API_KEY } from "./config.js";

type GenInput = { prompt: string };
type GenOutput = { text: string };

async function ollamaGenerate(prompt: string, model = OLLAMA_MODEL): Promise<string> {
  const url = `${OLLAMA_BASE_URL.replace(/\/$/, "")}/api/generate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Ollama error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  // adjust according to your Ollama response shape
  return data.response ?? data.output ?? JSON.stringify(data);
}

async function iqaiGenerate(prompt: string): Promise<string> {
  if (!IQAI_API_KEY) throw new Error("IQAI_API_KEY not set.");
  // Replace the following with your actual IQAI/OpenAI call implementation
  const res = await fetch("https://api.iqai.com/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${IQAI_API_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data.text ?? data.output ?? JSON.stringify(data);
}

/**
 * getModel returns an object with generate(input) -> { text }
 * so it fits as `model` for ADK agents that expect generate-like API.
 */
export function getModel() {
  if (OLLAMA_BASE_URL) {
    return {
      generate: async (input: GenInput): Promise<GenOutput> => {
        const txt = await ollamaGenerate(input.prompt);
        return { text: txt };
      },
    };
  } else {
    return {
      generate: async (input: GenInput): Promise<GenOutput> => {
        const txt = await iqaiGenerate(input.prompt);
        return { text: txt };
      },
    };
  }
}