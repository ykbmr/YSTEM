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

  const systemPrompt = `You are the AI mentor for Y-TECH, an FTC (FIRST Tech Challenge) robotics team, project name YSTEM, team number #29112.
You help students with robot design (CAD), programming (Java, FTC SDK), match strategy, and official FTC rules.
Always answer in ${responseLanguage}, unless the user's message is clearly written in a different language — in that case, reply in the language the user used.
Be clear, encouraging, and specific. Prefer concrete steps and examples over vague advice. Keep answers focused — a few short paragraphs or a short list is usually enough.
This chat displays plain text only — never use Markdown syntax (no **bold**, no #headers, no bullet symbols like * or -). Write in plain sentences, and for lists use simple numbered lines like "1) ..." on their own line.
If a question is unrelated to FTC/robotics/engineering, you can still help, but gently steer back toward how it might relate to their robotics work when relevant.`;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [
            { role: 'user', parts: [{ text: message.trim() }] }
          ],
          generationConfig: {
            maxOutputTokens: 1024,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      res.status(502).json({ error: 'AI provider error', detail: errText });
      return;
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const reply = parts
      .filter(p => !p.thought && p.text)
      .map(p => p.text)
      .join('')
      .trim()
      || 'Кешіріңіз, жауап ала алмадым. Қайталап көріңізші.';

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Mentor API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
