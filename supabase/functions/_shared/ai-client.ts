import Groq from "npm:groq-sdk";

const MODEL = "llama-3.3-70b-versatile";

function createGroqClient() {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  return new Groq({ apiKey });
}

export async function generateJsonFromAi<T>({
  prompt,
  schemaDescription,
}: {
  prompt: string;
  schemaDescription: string;
}): Promise<T> {
  const groq = createGroqClient();
  const response = await groq.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You generate strict JSON only. Do not include markdown fences or prose. Follow the requested schema exactly.",
      },
      {
        role: "user",
        content: `${schemaDescription}\n\n${prompt}`,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Groq did not return JSON content.");
  }

  return JSON.parse(content) as T;
}

export { MODEL as AI_MODEL };
