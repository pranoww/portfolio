// All text and data shown on the site, kept in one place so copy can change without touching components

export const profile = {
  name: "Pranav Lande",
  handle: "pranav.lande",
  role: "Full-stack and AI developer",
  currentJob: "Full-stack developer, One Health Assist",
  location: "Mumbai",
  timeZone: "Asia/Kolkata",
  email: "pranavlande555@gmail.com",
  githubUrl: "https://github.com/pranoww",
  linkedinUrl: "https://www.linkedin.com/in/pranavlande",
  resumePath: "/resume/Pranav_Kishor_Lande_Resume.pdf",
};

export const navigationLinks = [
  { label: "Work", href: "#work" },
  { label: "What I build", href: "#build" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about", isHiddenOnPhones: true },
];

export const helloWords = ["Hello", "नमस्ते", "नमस्कार", "Hola", "Bonjour", "こんにちは", "I'm Pranav"];

export const hero = {
  headline: "I build web apps and AI tools people enjoy using.",
  highlightedWord: "enjoy",
  intro: "I'm Pranav Lande, a full-stack developer at One Health Assist in Mumbai. I work across Next.js front ends, FastAPI back ends and the Postgres underneath, and lately a lot of LLM work.",
  cardCode: {
    fileName: "pranav.py",
    variableName: "pranav",
    entryList: [
      { key: "role", value: "full-stack developer" },
      { key: "city", value: "Mumbai" },
      { key: "works_at", value: "One Health Assist" },
      { key: "loves", value: ["FastAPI", "Next.js"] },
      { key: "learning", value: "LangGraph" },
      { key: "has_cat", value: true },
    ],
  },
};

export const selectedWork = {
  title: "Selected work",
  lead: "Two things I built on my own time, end to end: the product idea, the interface, the API and the database.",
};

export const projectList = [
  {
    slug: "jobscout",
    name: "jobscout",
    summary: "Finds fresh hiring posts on LinkedIn and public Telegram job channels, keeps only the ones with a recruiter's email or phone number, and helps send a short personal email to each recruiter from your own Gmail.",
    stack: ["FastAPI", "Next.js", "PostgreSQL", "Playwright"],
    githubUrl: "https://github.com/pranoww/jobscout",
    image: { src: "/projects/jobscout-scrape.png", width: 2160, height: 1350, alt: "jobscout's Scrape screen: keyword and channel filters on the left, a live list of found recruiter contacts on the right" },
  },
  {
    slug: "skin-care-ai",
    name: "Skin Care AI",
    summary: "Describe a skin concern by typing or speaking, and get a careful answer from Google Gemini, read back aloud. Medical safety guardrails and prompt-injection protection are built in.",
    stack: ["FastAPI", "Gemini", "Speech to text", "Next.js"],
    githubUrl: "https://github.com/pranoww/skin-care-ai",
    chatPreview: {
      question: "My cheeks get red and itchy after I wash my face. What could it be?",
      answer: "That often points to irritation from a harsh cleanser. Try a fragrance-free, gentle one for a week. If redness spreads or stings, please see a dermatologist.",
      status: "Voice reply playing",
    },
  },
];

export const statementBand = {
  quoteBefore: "I care about the details people actually feel, like a page that ",
  quoteHighlight: "opens instantly",
  quoteAfter: " or an AI answer you can trust.",
  statList: [
    { number: "4", text: "healthcare products I have worked on at One Health Assist" },
    { number: "2", text: "personal products built end to end" },
    { number: "1", text: "gray cat in charge of quality" },
  ],
};

export const buildItemList = [
  { number: "01", demo: "web", title: "Websites and web apps", description: "Layouts that hold up on every screen, from a wide monitor down to a phone.", proofPrefix: "Shipped in", proofList: ["PreventX", "Health Locker", "jobscout"], stackLine: "Next.js · React · Tailwind CSS · Node.js" },
  { number: "02", demo: "api", title: "Backends and APIs", description: "Clean data models, OTP login and role-based access that says no when it should.", proofPrefix: "Shipped in", proofList: ["OHA Admin", "Health Score"], stackLine: "Python · FastAPI · Flask · SQLAlchemy · Pydantic · PostgreSQL · MySQL · MongoDB · Docker" },
  { number: "03", demo: "ai", title: "AI features", description: "Assistants that answer from real knowledge and stay inside safe limits.", proofPrefix: "Shipped in", proofList: ["Skin Care AI"], stackLine: "Gemini · RAG · LangChain · LangGraph · Vector databases · Voice" },
  { number: "04", demo: "speed", title: "Speed and search", description: "The quiet fixes that make a page open fast and get found on Google.", proofPrefix: "Done at", proofList: ["One Health Assist"], stackLine: "Lighthouse · Core Web Vitals · SEO · Datadog" },
];

export const responsiveAppExample = {
  address: "localhost:3000/applications",
  appName: "Tracker",
  navigationItemList: ["Overview", "Jobs", "Calendar", "Settings"],
  heading: "Applications",
  statList: [
    { label: "Applied", value: "48" },
    { label: "Interviews", value: "6" },
    { label: "Offers", value: "1" },
  ],
  rowList: [
    { company: "Northwind", role: "Frontend developer", date: "12 Nov", status: "Interview" },
    { company: "Lumen Labs", role: "Full-stack engineer", date: "10 Nov", status: "Applied" },
    { company: "Kite and Co", role: "React developer", date: "7 Nov", status: "Offer" },
    { company: "Harbor", role: "Python developer", date: "3 Nov", status: "Applied" },
  ],
};

export const apiRequestList = [
  { method: "POST", path: "/auth/otp/verify", status: 200, duration: "41ms" },
  { method: "GET", path: "/scores/pillars", status: 200, duration: "18ms" },
  { method: "PATCH", path: "/admin/roles/7", status: 403, duration: "6ms" },
  { method: "POST", path: "/documents/merge", status: 201, duration: "212ms" },
  { method: "GET", path: "/locker/files?page=2", status: 200, duration: "24ms" },
];

export const aiChatExample = {
  question: "Is a gel moisturiser okay for oily skin?",
  answer: 'Yes. Gel moisturisers are light and usually suit oily skin. Look for "non-comedogenic" on the label, and patch-test first if your skin is sensitive.',
  badgeList: ["Safety check passed", "Voice reply ready"],
};

export const speedChecklist = [
  "Images resized and lazy-loaded",
  "Fonts load without a flash",
  "Layout shift removed",
  "Main image loads first",
  "Unused JavaScript split out",
  "Titles and meta tags for search",
];

export const experience = {
  title: "Experience",
  lead: "One Health Assist, Mumbai. November 2025 to now.",
  timelineMonths: ["Nov 25", "Dec", "Jan 26", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Now"],
  roleList: [
    {
      period: "Feb 2026 to now",
      title: "Software Developer, Full-Stack",
      pointList: [
        "Work on Health Score across the frontend, backend, database and admin workflows.",
        "Build FastAPI and Flask APIs, Next.js apps and PostgreSQL models with Alembic migrations.",
        "Implemented OTP login, role-based access, permissions and session management.",
      ],
      tagLabel: "Worked on",
      tagList: ["Health Score", "PreventX", "Health Locker", "OHA Admin"],
    },
    {
      period: "Nov 2025 to Jan 2026",
      title: "Software Development Intern",
      pointList: [
        "Audited pages with Google Lighthouse and fixed performance, SEO and accessibility issues.",
        "Improved image loading and Core Web Vitals across the site.",
      ],
      tagLabel: "Tools",
      tagList: ["Lighthouse", "Core Web Vitals"],
    },
  ],
};

export const aboutRoomIntro = { label: "My room", title: "Have a look around.", text: "Click a numbered dot to take a closer look." };

export const roomObjectList = [
  { label: "Based in", title: "Mumbai, India", text: "The view from here. Happy to work with teams anywhere, in person or remotely." },
  { label: "Day job", title: "Full-stack developer at One Health Assist", text: "Next.js on the front, FastAPI and PostgreSQL behind it. Most of my day lives on this screen." },
  { label: "Learning now", title: "RAG, vector search and LangGraph", text: "Building AI agents that can actually be trusted. The sticky notes keep changing." },
  { label: "Studied", title: "BCA, KCSM College, Bengaluru", text: "Plus a certification in Data Analytics using Python and Machine Learning." },
  { label: "Weekends", title: "Hill trails around Mumbai", text: "Most weekends I head up a hill. Best place to untangle a tricky bug." },
  { label: "Cat bed", title: "Usually occupied", text: "The gray cat is somewhere else on this page right now. Try the bottom-right corner.", isCatBed: true, occupiedTitle: "Occupied. Told you.", occupiedText: "He ran over the second you looked. Pick another spot and he'll go back to his corner." },
];


export const contact = {
  title: "Got something to build?",
  lead: "Tell me about it. I usually reply within a day.",
  successMessage: "Thanks! I'll get back to you soon.",
};

export const footerNote = "Built with Next.js. Gray cat approved.";

export const grayCatLines = {
  idle: ["Don’t mind me. Just supervising.", "I reviewed his code. Mostly fine.", "Your cursor looks tasty.", "brb, knocking something off a desk.", "Mrrp.", "Is it dinner time yet?", "Scroll faster. I’m bored.", "I could do his job. I just don’t want to.", "Don’t look at me. Look at his projects.", "I’d hire him. He feeds me on time."],
  hero: ["Hi. I’m the gray cat. He works for me.", "Head of QA, reporting for duty.", "Click me. I know things about him."],
  bed: ["MY BED! Coming!", "Hey! That's my spot!", "Nobody looks at my bed without me in it!"],
  chatHint: ["Click me. I know everything about him.", "Psst. Click me. Ask me anything.", "Got questions? I’m the expert. Click."],
  work: ["jobscout? I helped. I sat on the keyboard.", "Skin Care AI says my fur is perfect.", "This page loads fast. I checked."],
  experience: ["Health Score: mine is 10 out of 10.", "He works on Health Score. I work on the sofa."],
  about: ["He walks hills on weekends. I nap. Balance.", "Fact: I’m the better developer."],
  contact: ["Tell him your idea. I’ll supervise.", "Send the message. I won’t read it. Probably."],
  peek: ["psst.", "...is he gone?", "Hello? Anyone scrolling?", "I see you."],
  jump: ["Ta-da.", "Nailed it.", "Did you see that?"],
  click: ["Hey! I’m working.", "Purrr.", "Five more minutes.", "That tickles.", "Bug found: it was a moth.", "Did I say you could touch me?", "Bold of you.", "That’ll be one treat. Pay up.", "Ugh. Humans.", "Personal space. Look it up.", "Rude.", "You’re lucky I’m too lazy to scratch.", "Not now. I’m reviewing a pull request."],
  clickAnnoyed: ["Okay, that’s enough.", "Click me again. I dare you.", "I’m filing a bug report. About you.", "Stop. Or I knock your coffee over.", "Keep going and I sit on your keyboard.", "Do you click everyone like this?", "Fine. I’m ignoring you now.", "This is why I don’t like people."],
  chase: ["!!!", "MINE.", "Come back here!", "Lunch!", "Dinner is running away!", "Hold still, snack!"],
  missedMouse: ["I let it go. On purpose.", "That mouse is lucky I’m on a diet.", "I wasn’t even trying.", "It cheated. Clearly.", "That was cardio, not a chase.", "Next time, mouse. Next time.", "We don’t talk about that.", "I meant to do that.", "Whatever. Didn’t want it anyway.", "The floor was slippery. Not my fault."],
  exit: ["Be right back.", "Off to inspect the footer.", "Gotta check something."],
  name: ["Name’s Simbha, by the way.", "Simbha. Remember it."],
};

export const simbhaChat = {
  catButtonLabel: "Chat with Simbha the cat about Pranav",
  fallbackButtonLabel: "Chat with Simbha",
  title: "Simbha",
  subtitle: "Head of QA. Knows everything about his human.",
  greeting: "Oh! A visitor! You may ask ME, the magnificent Simbha, anything about my human. Go on, I'm busy being fabulous.",
  inputLabel: "Your question for Simbha",
  inputPlaceholder: "Ask about his work, skills, projects...",
  sendLabel: "Send",
  closeLabel: "Close",
  suggestedQuestionList: ["What has he built?", "What’s his tech stack?", "Can I hire him?"],
  thinkingLine: "Simbha is thinking...",
  tooManyQuestionsLineList: [
    "Chill out, dude! My human is already broke. Keep chatting and he'll be homeless.",
    "Don't you have anyone else to talk to? You've got way too much free time.",
    "Stop eating my brain! Get to the point, or I'm going to sleep.",
  ],
  goingToSleepLine: "You know what? I'm going to sleep. You've got nothing else to do, but I've got shit to do.",
  stillSleepingLine: "Get lost, man. Come back after some time.",
  napGrumbleLineList: [
    "Can't you see I'm taking a nap? Come back after some time.",
    "Ugh. NAPPING. Come back after some time.",
    "Rude! I'm asleep. Come back later.",
  ],
  wakeUpLineList: [
    "Uhhh, you woke me up from my nap! Fine. What do you want?",
    "Mrrrp... my beauty sleep. Okay, I'm up. What do you want?",
    "Ugh, you again? I was dreaming about tuna. Fine, what is it?",
  ],
  startOverLabel: "Start over",
  startOverLineList: [
    "Uhhh, a new conversation? With YOU again? Tsk. Fine, what do you want? Make it quick.",
    "Ugh, starting over? Tsk tsk. Go on then, and keep it short this time.",
    "Uhhh, fresh start? You again. What is it now? Quick, my nap is waiting.",
    "New conversation, huh? Tsk. Spit it out, and make it snappy this time.",
    "Uhhh, we're doing this AGAIN? Fine. What do you want? The clock's ticking.",
    "Tsk. Starting over won't make you more interesting. What now? Be quick.",
    "Oh great, round two. Tsk. Ask your thing, and this time get to the point.",
  ],
  nappingLine: "Simbha is napping. Try again in a bit.",
};
