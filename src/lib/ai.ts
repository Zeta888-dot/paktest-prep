export async function generateJSON(prompt: string, temperature = 1.0): Promise<string> {
  const key = process.env.TOKENROUTER_API_KEY

  if (key) {
    try {
      const res = await fetch("https://api.tokenrouter.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "z-ai/glm-5.3-free",
          messages: [{ role: "user", content: prompt }],
          temperature,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const text = data.choices?.[0]?.message?.content
        if (text) return text
      }
    } catch (e) {
      console.error("TokenRouter failed, falling back to Gemini:", e)
    }
  }

  const { GoogleGenAI } = await import("@google/genai")
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const res = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  })
  return res.text ?? "[]"
}