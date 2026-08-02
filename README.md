# Y-TECH | YSTEM #29112

Official website for **Y-TECH**, a FIRST Tech Challenge (FTC) robotics team (project name **YSTEM**, team #29112), built by students of Esik Bilim Innovation Lyceum, Kazakhstan.

**Live site:** [ystem-73zj.vercel.app](https://ystem-73zj.vercel.app/)

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Made with](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-orange)
![Backend](https://img.shields.io/badge/backend-Vercel%20Serverless-black)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-blue)

---

## About

Y-TECH is a student-run FTC robotics team that, alongside building its own competition robot, mentors other beginner teams in CAD, programming, and strategy free of charge. This site is the team's public hub: it introduces the team, connects visitors with mentors, and provides an AI-powered assistant for FTC-related questions.

## Features

- **Trilingual interface** — full Kazakh / Russian / English support with instant language switching, no page reload
- **AI Mentor** — a chat assistant (powered by Google Gemini) that answers questions about robot design, programming, match strategy, and official FTC rules
- **Mentor directory** — team mentor profiles with roles, short bios, and direct Telegram contact links
- **Learning materials** — expandable reference cards covering CAD/robot design, programming (Java + FTC SDK), competition strategy, and official rules
- **Responsive design** — custom blueprint/engineering-inspired visual style, works on desktop and mobile
- **SEO-ready** — meta description, favicon, and Google Search Console verification included

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework — single static file) |
| Backend | Node.js Serverless Function (Vercel) |
| AI | Google Gemini API (`gemini-3.6-flash`, with automatic fallback and retry) |
| Hosting | Vercel (Hobby / free tier) |
| Version control | Git + GitHub |

No frontend build step is required — `index.html` is served as-is, and `/api/mentor.js` runs as a serverless function.

## Project Structure

```
├── index.html          # Full frontend: markup, styles, and client-side logic
├── api/
│   └── mentor.js        # Serverless function — calls Gemini API, keeps the key server-side
├── assets/               # Logos and favicon
├── package.json
├── vercel.json
└── README.md
```

## How the AI Mentor Works

The chat UI in `index.html` sends the visitor's message to `POST /api/mentor`. The serverless function (`api/mentor.js`) attaches a system prompt (team context + response language), calls the Gemini API using a server-side API key, and returns a plain-text reply. The API key is never exposed to the browser — it's read from an environment variable (`GEMINI_API_KEY`) that only exists on the server.

## Running / Deploying Your Own Copy

1. Fork or clone this repository
2. Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com) (no credit card required)
3. Deploy to [Vercel](https://vercel.com) by importing the repository
4. In the Vercel project, add an environment variable:
   - `GEMINI_API_KEY` = your key
5. Deploy — Vercel builds the static frontend and the `/api/mentor` serverless function automatically

For a detailed step-by-step walkthrough (in Kazakh), see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Team

| Role | Name | Contact |
|---|---|---|
| CAD Mentor | Rasul | [@mrgeniusmrv](https://t.me/mrgeniusmrv) |
| Programmer | Shyngys | [@Thefrosti](https://t.me/Thefrosti) |
| Inspire / Captain | Kemenger | [@kema73](https://t.me/kema73) |
| Engineer | Ali | [@rarree_21](https://t.me/rarree_21) |

## About the Developer

**Yerkinbek Miras** — Inspire team member at Y-TECH, and the developer of this website (frontend, backend, and AI integration). Built as a personal initiative to strengthen his own research and hands-on development experience — from UI design and multilingual support to deploying a working AI-powered backend in production.

## About FTC

[FIRST Tech Challenge](https://www.firstinspires.org/robotics/ftc) is an international robotics competition for students, combining engineering, programming, and strategy. Y-TECH competes as team **#29112** under the project name **YSTEM**.

---

*Built by students of Esik Bilim Innovation Lyceum, Kazakhstan.*
