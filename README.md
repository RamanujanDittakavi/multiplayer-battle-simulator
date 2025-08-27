Poll & Game Room App

A full-stack web app where users can create polls, share links/QR codes, and participate in team-based games.
Built with React (Vite + Tailwind) on the frontend and Node.js (Express + Socket.IO + NeDB) on the backend.

🚀 Features

Create and share polls with unique links.

Real-time interaction via Socket.IO.

Team building, drafting, and voting phases.

QR code generation for quick poll sharing.

Responsive UI built with TailwindCSS.

Lightweight in-memory DB (NeDB) for easy setup.

📦 Tech Stack

Frontend

React + Vite + TypeScript

TailwindCSS

React Router

Backend

Node.js + Express

Socket.IO

NeDB (in-memory database)

QRCode.js

🛠️ Setup & Installation
1. Clone the repo
git clone 
cd poll-app

2. Install dependencies

Frontend + backend are in the same repo.

# Install root dependencies (if any)
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

3. Start development servers

Backend (port 5000):

cd backend
npm run dev


Frontend (port 5173):

cd frontend
npm run dev


Now open 👉 http://localhost:5173
.

🌐 Environment Variables

Create a .env file in backend/ with:

PORT=5000
FRONTEND_URL=http://localhost:5173

📄 API Routes

POST /poll → Create a new poll (returns poll link).

GET /poll/:id → Fetch poll details.

WebSocket events handle voting, team drafting, and game states.

🖼️ Example Poll Flow

User creates a poll.

Backend returns link → http://localhost:5173/poll/<id>.

Others can join using link or QR code.

Voting and team phases happen in real time.

📦 Production Build

Build frontend:

cd frontend
npm run build


Copy dist/ folder into backend root.

Start backend:

cd backend
npm start


Express will serve both API + frontend from the same server.

✨ Future Improvements

Persistent database (MongoDB/Postgres).

User authentication.

Better error handling & validation.

Deployment with Docker or cloud hosting.