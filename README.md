# Perplexity Clone — AI-Powered Search & Chat App

A full-stack, web-connected AI chat application inspired by Perplexity. Instead of answering purely from a language model's training data, it uses a **LangChain agent** that can decide, mid-conversation, to search the live web for grounded, up-to-date answers.

**🔗 [Live Demo](https://perplexity-ai-assistant-lake.vercel.app)**

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-000000?style=flat&logo=vercel&logoColor=white)](https://perplexity-ai-assistant-lake.vercel.app)

## 🚀 Features

- **Agentic web-connected AI answers** — A LangChain agent running on Google Gemini decides when it needs fresh information and calls a custom `search-web` tool backed by the Tavily API, then synthesizes the results into a sourced answer.
- **Auto-generated chat titles** — The first message of every new conversation is summarized into a short, relevant title using Mistral AI, so chat history stays readable without any manual naming.
- **Persistent chat history** — Every conversation and message is stored per-user in MongoDB. Users can revisit, reopen, or delete past chats from a sidebar.
- **Markdown-rendered responses** — AI replies are rendered with `react-markdown`, so formatted text, lists, and code blocks display cleanly.
- **Secure authentication** — Registration and login with bcrypt-hashed passwords, JWT issued in an HTTP-only cookie, and route-level middleware protecting the chat API.
- **Email verification** — New accounts receive a verification email (Nodemailer + Gmail OAuth2) with a signed JWT link before they're allowed to log in.
- **Input validation** — Registration and login payloads are validated server-side with `express-validator` before touching the database.
- **Real-time infrastructure in place** — A Socket.io server and client are already wired up and ready to carry the chat experience from request/response to live streaming (see [Roadmap](#-roadmap)).

## 🛠️ Tech Stack

**Frontend**
- React 19 (Vite)
- Redux Toolkit (auth + chat state)
- React Router 7
- Tailwind CSS v4
- react-markdown
- Axios, Socket.io-client

**Backend**
- Node.js & Express 5
- MongoDB & Mongoose
- JWT & bcrypt (auth)
- express-validator (request validation)
- Socket.io (real-time transport layer)
- Nodemailer with Gmail OAuth2 (transactional email)
- Morgan (logging), CORS

**AI & Search**
- LangChain (`createAgent`) — agent orchestration and tool-calling
- Google Gemini (`@langchain/google-genai`) — primary reasoning model
- Mistral AI (`@langchain/mistralai`) — fast chat-title generation
- Tavily API — real-time web search tool the agent can call
- Zod — schema validation for the agent's tool arguments

**Deployment**
- Frontend on Vercel
- Backend on Render
- Database on MongoDB Atlas

## ⚙️ How It Works

1. **Sign up & verify** — A user registers, receives a verification email, and confirms their address before they can log in.
2. **Log in** — On success, the server issues a JWT in an HTTP-only cookie; the frontend fetches the current user (`/api/auth/get-me`) to hydrate session state.
3. **Send a message** — The frontend posts the message to `/api/chats/message`. If it's a new conversation, the backend asks Mistral for a short title and creates a `Chat` document.
4. **Agent reasoning** — The full message history for that chat is loaded from MongoDB and handed to the LangChain agent running on Gemini.
5. **Tool use** — If the agent decides it needs current information, it invokes the `search-web` tool, which queries the Tavily API and returns ranked results back into the agent's reasoning loop.
6. **Response & persistence** — The agent's final answer is saved as an assistant message and returned to the client, where it renders as Markdown in the chat window.

## 📁 Project Structure

```
Perplexity/
├── Backend/
│   ├── server.js                 # Entry point (HTTP server + Socket.io)
│   └── src/
│       ├── app.js                # Express app & middleware
│       ├── config/                # DB connection
│       ├── controllers/           # auth.controller.js, chat.controller.js
│       ├── middlewares/           # JWT auth guard
│       ├── models/                # User, Chat, Message (Mongoose)
│       ├── routes/                # /api/auth, /api/chats
│       ├── services/              # ai.service.js, internet.service.js, mail.service.js
│       ├── sockets/                # Socket.io setup
│       └── validators/            # express-validator rules
└── Frontend/
    └── src/
        ├── App/                   # Router, Redux store, root component
        └── features/
            ├── auth/               # Login, Register, protected routes
            └── chat/               # Dashboard, chat hook, API/socket services
```

## 🏃 Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB connection string (local or Atlas)
- API keys: [Google Gemini](https://aistudio.google.com/), [Mistral AI](https://console.mistral.ai/), [Tavily](https://tavily.com/)
- A Gmail account set up for OAuth2 (Client ID, Client Secret, Refresh Token) for sending verification emails

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/perplexity-clone.git
cd perplexity-clone
```

### 2. Backend setup
```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_google_gemini_key
MISTRAL_API_KEY=your_mistral_key
TAVILY_API_KEY=your_tavily_api_key

GOOGLE_USER=your_gmail_address
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_google_oauth_refresh_token
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../Frontend
npm install
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173`. The backend runs on `http://localhost:3000`.

## 🗺️ Roadmap

- Stream agent responses token-by-token over the existing Socket.io connection instead of waiting for the full reply
- Show source citations from Tavily search results alongside AI answers
- Global keyboard shortcut for quick chat search/switching

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
