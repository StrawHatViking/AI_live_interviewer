# Crazyy AI Live Interviewer

A real-time, voice-to-voice AI mock interviewer powered by the **Gemini Live API**. Crazyy reads your resume, conducts a dynamic technical interview, and provides actionable feedback and a final score based on your performance.

## 🚀 Features

- **Real-Time Voice Conversation:** Low-latency voice streaming using Web Audio API and the Gemini Live SDK.
- **Resume Context:** Upload your PDF resume, and the AI will dynamically tailor its questions to your actual experience and tech stack.
- **Cross-Browser Audio Pipeline:** Custom-built audio processing with intelligent mic-gating to prevent echo feedback loops (fully compatible with Chrome, Firefox, and Safari).
- **Beautiful UI:** Modern, responsive interface with fluid animations (Framer Motion), real-time audio visualization, and premium typography.
- **Performance Evaluation:** Get a final score out of 100, detailed AI feedback, and a full transcript of your interview session.

## 🛠️ Tech Stack

- **Monorepo:** Turborepo + Bun
- **Frontend:** React, TailwindCSS, Framer Motion, Lucide Icons
- **Backend:** Node.js, Express, Prisma ORM (PostgreSQL)
- **AI:** Google Gen AI SDK (`gemini-3.1-flash-live-preview`)

## 📦 Local Development

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine
- A PostgreSQL database (local or cloud like Supabase/Neon)
- A Gemini API Key from Google AI Studio

### Setup

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd AI_Live_Interviewer
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Configure Environment Variables:**
   - Copy the example env file in the root: `cp .env.example .env`
   - Fill in your `DATABASE_URL` and `GEMINI_API_KEY` in the `.env` file (and potentially in `apps/backend/.env` if required by your setup).

4. **Initialize the Database:**

   ```bash
   cd apps/backend
   npx prisma db push
   # or npx prisma migrate dev
   ```

5. **Start the Development Servers:**
   From the root of the project, run:
   ```bash
   bun run dev
   ```
   - The frontend will be available at `http://localhost:5173`
   - The backend will run on `http://localhost:3000`

## 🧠 Architecture Notes

- **Client-Side Audio:** The frontend establishes a direct WebSocket connection to the Gemini Live API for real-time audio streaming. This reduces latency by cutting out the middleman server.
- **Backend Role:** The Node.js backend handles secure token generation, PDF parsing, interview initialization, and securely storing the final scores and transcripts in the PostgreSQL database.
- **Firefox Compatibility:** The Web Audio API implementation utilizes manual 16kHz resampling and state-based mic muting during AI speech to prevent severe acoustic echo cancellation (AEC) failures natively found in Firefox.

## 📄 License

MIT
