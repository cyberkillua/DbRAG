// src/llm/ollama.ts
export async function generateWithOllama(
  model: string,
  prompt: string,
): Promise<string> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Ollama failed: ${response.statusText}`);
  }

  const data: any = await response.json();
  return data.response
    .trim()
    .replace(/```sql/gi, "")
    .replace(/```/g, "")
    .trim();
}
