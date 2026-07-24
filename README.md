# Expense Tracker – AI-Powered Finance App

A full-stack MERN application for tracking personal expenses with AI-powered financial insights, multi-currency support, and a calendar-based expense entry system.

## Features
- 🔐 JWT-based authentication with bcrypt password hashing
- 📅 Calendar-based expense logging — add and view expenses by specific date
- 📊 Analytics dashboard with daily/weekly/monthly spending breakdowns by category (Recharts)
- 🤖 AI-generated spending insights and savings recommendations using Google Gemini
- 💱 Multi-currency support, customizable per user
- 🔒 Protected REST APIs secured with JWT middleware

## Tech Stack
- **Frontend:** React, React Router, Context API, Axios, Recharts
- **Backend:** Node.js, Express.js, JWT, bcrypt
- **Database:** MongoDB (Mongoose)
- **AI:** Google Gemini API

## Getting Started

### Backend
cd backend
npm install
Create a `.env` file inside `backend/` with:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
Then run:
node server.js

### Frontend
cd frontend
npm install
Create a `.env` file inside `frontend/` with:
VITE_API_URL=http://localhost:5000
Then run:
npm run dev
## Author
Gouransh Upadhyay
