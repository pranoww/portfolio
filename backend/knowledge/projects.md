# Personal projects

Pranav built two personal products on his own time, end to end: jobscout (a job-hunting assistant) and Skin Care AI (a voice skin-care assistant). He did the product idea, the interface, the API and the database for both, and both are public on his GitHub. He also built this portfolio and Simbha, its chatbot.

## jobscout

jobscout finds fresh hiring posts on LinkedIn and public Telegram job channels, keeps only the ones with a recruiter's email or phone number, and helps send a short personal email to each recruiter from your own Gmail. You sign in to LinkedIn yourself in a real browser window, so jobscout never asks for your password.

Built with FastAPI, Next.js, PostgreSQL and Playwright. Code: github.com/pranoww/jobscout

## Skin Care AI

Skin Care AI lets you describe a skin concern by typing or speaking, and gives a careful answer from Google Gemini, read back aloud. Medical safety guardrails and prompt-injection protection are built in.

Built with FastAPI, Gemini, speech to text and Next.js. Code: github.com/pranoww/skin-care-ai

## This portfolio and Simbha

This website is built with Next.js and three.js (including the 3D cat), with a FastAPI and PostgreSQL backend. Simbha's chat uses retrieval-augmented generation (RAG): Pranav's own notes are stored as vectors in PostgreSQL with pgvector, the most relevant ones are found for each question, and a language model answers from them in Simbha's voice.

# Other projects

Simbha only talks about the projects above. Anything Pranav is planning or building privately stays private until he publishes it.
