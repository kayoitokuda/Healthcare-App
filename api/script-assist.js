export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!token) return response.status(401).json({ error: "Sign in to use AI draft assist." });
  if (!supabaseUrl || !supabaseKey) {
    return response.status(503).json({ error: "AI draft assist needs the existing Supabase URL and publishable key available to the server function." });
  }
  if (!openaiKey) {
    return response.status(503).json({ error: "AI draft assist is not configured yet. Add OPENAI_API_KEY to the Vercel preview environment." });
  }

  try {
    const userResponse = await fetch(new URL("/auth/v1/user", supabaseUrl), {
      headers: { apikey: supabaseKey, Authorization: "Bearer " + token },
    });
    if (!userResponse.ok) return response.status(401).json({ error: "Your session could not be verified. Sign in again." });
    const user = await userResponse.json();
    if (!user || !user.id) return response.status(401).json({ error: "Your session could not be verified. Sign in again." });

    const body = request.body && typeof request.body === "object" ? request.body : {};
    const kind = typeof body.kind === "string" ? body.kind : "";
    const language = typeof body.language === "string" ? body.language : "en";
    const draft = typeof body.draft === "string" ? body.draft.trim() : "";
    if (!["Call script", "Portal message", "Email"].includes(kind)) {
      return response.status(400).json({ error: "Choose a valid draft format." });
    }
    if (!["en", "ja", "zh", "es", "vi"].includes(language)) {
      return response.status(400).json({ error: "Choose a supported language." });
    }
    if (!draft || draft.length > 5000) {
      return response.status(400).json({ error: "The draft must contain 1 to 5,000 characters." });
    }

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + openaiKey,
      },
      body: JSON.stringify({
        model: "gpt-6-luna",
        store: false,
        max_output_tokens: 600,
        instructions: [
          "Rewrite the user's communication draft to make it clearer, concise, respectful, and easy for an office to answer.",
          "Preserve its language, format, factual meaning, and any placeholders. Do not add facts, diagnoses, dates, coverage claims, referral status, or promises.",
          "Do not give medical, insurance, or legal advice. Keep it as a communication draft only.",
          "Return only the rewritten draft, with no preamble or explanation."
        ].join(" "),
        input: "Format: " + kind + "\nLanguage code: " + language + "\n\nDraft to rewrite:\n" + draft,
      }),
    });
    const result = await aiResponse.json().catch(() => ({}));
    if (!aiResponse.ok) {
      console.error("AI draft request failed with status", aiResponse.status);
      return response.status(502).json({ error: "The AI service could not improve this draft. Please try again." });
    }
    const rewritten = typeof result.output_text === "string"
      ? result.output_text.trim()
      : (result.output || []).flatMap((item) => item.content || [])
          .filter((item) => item.type === "output_text")
          .map((item) => item.text || "")
          .join("\n")
          .trim();
    if (!rewritten) return response.status(502).json({ error: "The AI returned an empty draft. Please try again." });
    return response.status(200).json({ draft: rewritten });
  } catch (error) {
    console.error("AI draft assist request failed", error instanceof Error ? error.message : "unknown error");
    return response.status(502).json({ error: "AI draft assist could not reach its services. Please try again." });
  }
}
