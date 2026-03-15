# 🧠 MeetMind — AI Meeting Intelligence Dashboard

![MeetMind](https://img.shields.io/badge/MeetMind-AI%20Powered-6366f1?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-06b6d4?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18+-61dafb?style=for-the-badge&logo=react)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285f4?style=for-the-badge&logo=google)

> Transform your meeting transcripts into actionable intelligence with AI

🔗 **Live Demo:** https://meetmind-gamma.vercel.app

---

## 🚀 What is MeetMind?

MeetMind is a full-stack AI-powered web application that analyzes meeting transcripts and provides deep behavioral insights. Unlike tools that just transcribe, MeetMind measures **productivity**, **engagement**, and **outcomes**.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 Meeting Health Score | AI-generated 0-100 productivity score |
| 📊 Engagement Analysis | Individual participation scores per person |
| 💬 Sentiment Detection | Positive / Neutral / Negative per participant |
| 📝 Auto Follow-ups | Personalized action items per participant |
| 🔐 Authentication | Secure JWT-based login and register |
| 📚 Meeting History | Save and review past analyses |
| 📱 Responsive Design | Works on desktop, tablet, and mobile |

---

## 🛠️ Tech Stack

### Frontend
- **React + Vite** — Fast, modern UI framework
- **Recharts** — Interactive engagement charts
- **Axios** — HTTP client for API calls
- **Custom CSS** — Dark theme design system

### Backend
- **Python FastAPI** — High-performance API server
- **SQLAlchemy + SQLite** — Database ORM
- **JWT + bcrypt** — Secure authentication
- **Google Gemini 1.5 Flash** — AI analysis engine

### Deployment
- **Frontend** → Vercel
- **Backend** → Railway
- **Version Control** → GitHub

---

## 📁 Project Structure

```text
meetmind/
├── main.py                 # FastAPI app entry point
├── database.py             # SQLAlchemy models
├── auth.py                 # JWT authentication
├── dependencies.py         # Shared dependencies
├── requirements.txt        # Python dependencies
├── Procfile                # Railway deployment config
├── routers/
│   ├── meeting.py          # Analysis & history endpoints
│   └── auth_router.py      # Register & login endpoints
├── services/
│   └── analyzer.py         # Gemini AI integration
└── frontend/               # React + Vite app
    ├── src/
    │   └── App.jsx         # Main dashboard component
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/register | Create account | ❌ |
| POST | /api/login | Login, get JWT | ❌ |
| POST | /api/analyze | Analyze transcript | ✅ |
| GET | /api/meetings | Meeting history | ✅ |

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Gemini API Key (free at aistudio.google.com)

### Backend Setup
```bash
git clone https://github.com/dbee-4/meetmind.git
cd meetmind
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env
py -m uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Open App
- Frontend: http://localhost:5173
- Backend Docs: http://127.0.0.1:8000/docs

---

## 🧠 How It Works

1. User pastes meeting transcript + participants
2. Frontend sends to FastAPI backend
3. Backend calls Google Gemini AI
4. Gemini returns structured JSON analysis
5. Results displayed as interactive dashboard

---

## 🔐 Security

- Passwords hashed with **bcrypt**
- **JWT tokens** for stateless authentication
- API keys stored as **environment variables**
- **CORS** configured for production URLs only
- All endpoints validated with **Pydantic**

---

## 📸 Screenshots

> Dashboard showing Meeting Health Score, Engagement Chart, Sentiment Analysis and Follow-up Actions

---

## 🙋 Author

Built by **Deee** — AI & Data Science Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077b5?style=flat&logo=linkedin)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github)](https://github.com/dbee-4)

---

## 📄 License

MIT License — feel free to use and modify
