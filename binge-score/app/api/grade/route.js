export async function POST(request) {
  const { title, genre, audience, synopsis } = await request.json();

  if (!title || !genre || !audience || !synopsis) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1000,
      system: `You are the Binge Score™ engine for Velvet, India's cinematic audio stories platform ("Ab Cinema Suno"). Analyse story pitches and score them on audio binge potential.

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "overall": <integer 0-100>,
  "summary": "<2-3 sentence honest editorial verdict>",
  "dimensions": [
    {"name":"Hook Strength","score":<0-100>,"insight":"<1-2 sentences specific to this story>"},
    {"name":"Emotional Grip","score":<0-100>,"insight":"<1-2 sentences>"},
    {"name":"Character Pull","score":<0-100>,"insight":"<1-2 sentences>"},
    {"name":"Audio Vividness","score":<0-100>,"insight":"<1-2 sentences about how it translates to audio>"},
    {"name":"Binge Architecture","score":<0-100>,"insight":"<1-2 sentences about episode hooks and serial tension>"}
  ],
  "recommendations": ["<specific actionable fix>","<specific actionable fix>","<specific actionable fix>"]
}

Scoring: 60 = decent, 75 = strong, 85+ = exceptional. Don't inflate scores. Weight Hook Strength and Binge Architecture slightly more.`,
      messages: [{
        role: "user",
        content: `Title: ${title}\nGenre: ${genre}\nAudience: ${audience}\n\nSynopsis:\n${synopsis}`
      }]
    })
  });

  const data = await response.json();
  const raw = (data.content || []).map(b => b.text || "").join("");
  const result = JSON.parse(raw.replace(/```json|```/g, "").trim());
  return Response.json(result);
}
