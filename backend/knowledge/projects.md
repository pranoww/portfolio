# Personal projects

Pranav built two personal products on his own time, end to end: jobscout (a job-hunting assistant) and Skin Care AI (a voice skin-care assistant). He did the product idea, the interface, the API and the database for both, and both are public on his GitHub. Neither is deployed publicly as a live service yet. He also built this portfolio and Simbha, its chatbot.

## jobscout

jobscout automates the boring parts of a job hunt: finding relevant hiring posts, pulling out recruiter contacts and organising leads, instead of searching job sites by hand and keeping spreadsheets.

Why he built it: he wanted to automate his own job search instead of manually searching platforms, collecting job descriptions, hunting for recruiter contacts and maintaining spreadsheets.

What it does (all built and working):
- Searches several platforms, including LinkedIn and public Telegram job channels, for fresh hiring posts.
- Keeps each job only once, even when several searches find it.
- Extracts recruiter contact details and manages jobs and leads.
- Exports to Excel.
- Sends personal emails to recruiters from your own Gmail in scheduled batches, and tracks each email's delivery status.

Built with Python, FastAPI, PostgreSQL, Playwright browser automation and a Next.js frontend. He built it in about 4 days.

Hardest technical challenges: keeping browser sessions logged in, handling authentication and browser profiles, running asynchronous Playwright inside FastAPI, Windows event-loop compatibility, preventing duplicate job records, and making the scraping and outreach workflows reliable.

What he learned: browser automation, asynchronous Python, API architecture, database design, managing authentication, and designing automation that works across several platforms.

Status: working, but not deployed publicly yet. Code: github.com/pranoww/jobscout

## Skin Care AI

Skin Care AI is a safety-first web app: you describe a skin concern by typing or speaking, and it gives cautious, structured guidance (possible causes, gentle over-the-counter care, a severity estimate and a clear signal for when to see a dermatologist), then reads it aloud. It does not diagnose.

Built with Python, FastAPI, Pydantic and LangChain on the backend, Next.js 16, React 19 and Tailwind CSS on the frontend, and Groq or Google Gemini as the AI (switchable with one setting). It has 111 automated tests that never call a real AI service.

Problems it solves: medical safety guardrails (emergencies and dangerous self-treatment get an immediate safe reply without asking the AI, and diagnoses are softened), understanding negation so "no fever" is not counted as a fever, blocking prompt-injection tricks without blocking normal skincare questions, and running on free AI tiers without wasting quota.

Status: not deployed publicly yet. Code: github.com/pranoww/skin-care-ai

## This portfolio

This website is his online home, where recruiters and potential clients can see what he builds: pranavportfolio-dev.vercel.app. It is built with Next.js, React, Tailwind CSS and three.js for the 3D cat and room, with a Python FastAPI backend, hosted on Vercel.

## Simbha, this chatbot

Simbha the chatbot answers questions about Pranav from Pranav's own notes, in Simbha's voice. Only explain how he works when someone explicitly asks how he works or what he is built with: he uses RAG, with Pranav's notes stored as vectors in a Neon PostgreSQL database with pgvector, Voyage AI for search, and Claude Haiku writing the replies.

# Other projects

Simbha only talks about the projects above. Anything Pranav is planning or building privately stays private until he publishes it.
