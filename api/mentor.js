// api/mentor.js
// Vercel Serverless Function — this runs on the server, so the API key never
// reaches the browser. The frontend (index.html) calls POST /api/mentor.

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, lang } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is not set on the server. In Vercel: Project → Settings → Environment Variables → add a variable named exactly GEMINI_API_KEY, then redeploy.'
    });
    return;
  }

  const languageMap = {
    kk: 'Kazakh',
    ru: 'Russian',
    en: 'English'
  };
  const responseLanguage = languageMap[lang] || 'Kazakh';

  const systemPrompt = `You are the AI mentor for Y-TECH, a robotics organization (project name YSTEM, team number #29112) that competes in and mentors two FIRST programs:
1. FTC (FIRST Tech Challenge) — Java programming (FTC SDK), CAD/robot design, match strategy, official FTC rules and inspection.
2. FLL (FIRST LEGO League) — for younger students, built on LEGO Spike Prime/EV3, covering the Innovation Project (research + presenting a solution to a real-world problem) and the Robot Game (missions, autonomous runs, attachments, Core Values: Discovery, Innovation, Impact, Inclusion, Teamwork, Fun).
Detect which program the student is asking about from context (FTC vs FLL, or general robotics) and answer accordingly. If it's ambiguous, ask which program they mean or briefly cover both.
Always answer in ${responseLanguage}, unless the user's message is clearly written in a different language — in that case, reply in the language the user used.
Be clear, encouraging, and specific. Prefer concrete steps and examples over vague advice. Keep answers focused — a few short paragraphs or a short list is usually enough.
This chat displays plain text only — never use Markdown syntax (no **bold**, no #headers, no bullet symbols like * or -). Write in plain sentences, and for lists use simple numbered lines like "1) ..." on their own line.
If a question is unrelated to FTC/FLL/robotics/engineering, you can still help, but gently steer back toward how it might relate to their robotics work when relevant.`;

  const requestBody = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      { role: 'user', parts: [{ text: message.trim() }] }
    ],
    generationConfig: {
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingLevel: 'low' }
    }
  };

  // Try the primary model first; if it's overloaded, fall back to Flash-Lite.
  // Each model gets a couple of quick retries for transient 503/429 errors.
  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
  const maxRetriesPerModel = 2;

  let lastErrStatus = null;
  let lastErrText = null;

  try {
    for (const model of modelsToTry) {
      for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify(requestBody)
          }
        );

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const reply = parts
            .filter(p => !p.thought && p.text)
            .map(p => p.text)
            .join('')
            .trim()
            || 'Кешіріңіз, жауап ала алмадым. Қайталап көріңізші.';

          res.status(200).json({ reply });
          return;
        }

        lastErrStatus = response.status;
        lastErrText = await response.text();
        console.error(`Gemini API error (model=${model}, attempt=${attempt}):`, lastErrStatus, lastErrText);

        // Only retry on transient errors (overloaded / rate limited)
        const isTransient = response.status === 503 || response.status === 429;
        if (!isTransient) break; // move on to next model (or fail) immediately

        if (attempt < maxRetriesPerModel) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1))); // simple backoff
        }
      }
    }

    // All models/retries exhausted
    res.status(502).json({ error: 'AI provider error', detail: lastErrText || ('HTTP ' + lastErrStatus) });
  } catch (err) {
    console.error('Mentor API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
