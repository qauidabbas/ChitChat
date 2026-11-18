# ChitChat

ChitChat is a modern, real-time chat application built with a robust **Microservices Architecture**. It features real-time messaging, image sharing, user authentication with OTP email verification, and a sleek, responsive UI.

## 🏗️ Architecture & Tech Stack

The application is split into a frontend client and three distinct backend microservices:

### Frontend (`/frontend`)
*   **Framework**: Next.js 16 (App Router) & React 19
*   **Styling**: Tailwind CSS v4
*   **Real-time & HTTP**: Socket.io-client, Axios
*   **State Management**: React Context API (`AppContext`, `SocketContext`)

### Backend Microservices (`/backend`)
*   **User Service (`/backend/user`)**: Handles authentication, user profiles, friend requests, and JWT generation. Uses **Redis** for OTP rate limiting and temporary sessions.
*   **Chat Service (`/backend/chat`)**: Handles real-time messaging using **Socket.io**. Manages message history and handles image uploads via **Cloudinary** and **Multer**.
*   **Mail Service (`/backend/mail`)**: An asynchronous worker service that listens to **RabbitMQ** to send OTP verification emails via **Nodemailer**.

### Infrastructure & Databases
*   **MongoDB (Mongoose)**: Primary database for Users and Chats/Messages.
*   **Redis**: Caching and temporary state (OTP storage).
*   **RabbitMQ**: Message broker for asynchronous communication between services (User Service -> Mail Service).

---

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js** (v18 or higher)
*   **MongoDB** (Local or Atlas)
*   **Redis** (Local or Upstash)
*   **RabbitMQ** (Local or CloudAMQP)
*   **Cloudinary Account** (For image uploads)
*   **Gmail Account** (With an App Password for Nodemailer)

---

## 🛠️ Setup & Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ChitChat
```

### 2. Install Dependencies
You need to install dependencies for the frontend and all three backend services.
```bash
# Frontend
cd frontend && npm install && cd ..

# User Service
cd backend/user && npm install && cd ../..

# Chat Service
cd backend/chat && npm install && cd ../..

# Mail Service
cd backend/mail && npm install && cd ../..
```

### 3. Environment Variables

You need to set up `.env` files in each of the four main directories. Each directory has a `.env.example` to copy (`cp .env.example .env`, or `.env.local` for the frontend). `.env` files are git-ignored; never commit them.

**`frontend/.env.local`**
```env
NEXT_PUBLIC_USER_SERVICE=http://localhost:5000
NEXT_PUBLIC_CHAT_SERVICE=http://localhost:5002
```

**`backend/user/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
RABBITMQ_HOST=localhost
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
JWT_TOKEN=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000
```

**`backend/chat/.env`**
```env
PORT=5002
MONGO_URI=your_mongodb_connection_string
JWT_TOKEN=your_super_secret_jwt_key
USER_SERVICE=http://localhost:5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

**`backend/mail/.env`**
```env
PORT=5001
RABBITMQ_HOST=localhost
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
MAIL_USER=your_gmail_address@gmail.com
MAIL_PASS=your_16_character_google_app_password
```

---

## 🏃‍♂️ Running the Application Locally

To run the application locally, you need to start the frontend and all three backend services in separate terminal windows.

**Terminal 1: Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 2: User Service**
```bash
cd backend/user
npm run dev
```

**Terminal 3: Chat Service**
```bash
cd backend/chat
npm run dev
```

**Terminal 4: Mail Service**
```bash
cd backend/mail
npm run dev
```

The application should now be running. Open your browser and navigate to `http://localhost:3000`.

---

## 🐳 Running with Docker

`docker-compose.yml` runs the whole stack: MongoDB, Redis, RabbitMQ, the three backend services and the frontend.

1. Create `backend/user/.env`, `backend/chat/.env` and `backend/mail/.env` from their `.env.example` files. Compose reads `JWT_TOKEN`, Cloudinary and Gmail credentials from them; database, Redis and RabbitMQ settings are provided by compose.
2. Optionally copy `.env.example` to `.env` at the repo root to change RabbitMQ credentials, use hosted MongoDB/Redis, or set public URLs.
3. Start everything:
```bash
docker compose up -d --build
```
Open `http://localhost:3000`. The browser-facing URLs (`NEXT_PUBLIC_*`) are baked into the frontend image, so rebuild after changing them.

### Public deployment (single server, automatic HTTPS)

`docker-compose.prod.yml` adds [Caddy](https://caddyserver.com) in front of the stack. It obtains a TLS certificate for your domain and serves everything on one origin: the frontend at `/`, the user API at `/user-api` and the chat API at `/chat-api`. Only ports 80 and 443 are exposed.

1. Get a server (Ubuntu, 2 GB+ RAM) and point your domain's DNS `A` record at its IP. Open ports 80 and 443.
2. Install Docker: `curl -fsSL https://get.docker.com | sh`
3. `git clone https://github.com/qauidabbas/ChitChat && cd ChitChat`
4. Create `backend/user/.env`, `backend/chat/.env` and `backend/mail/.env` from their `.env.example` files (`JWT_TOKEN` must match in user and chat).
5. `cp .env.example .env`, then set `DOMAIN` and a strong `RABBITMQ_PASSWORD`.
6. Start:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
The app is live at `https://<DOMAIN>`. To update later: `git pull` and rerun the same command.

Without Docker, `scripts/start-prod.sh` builds every service and starts them in the background (logs go to `logs/`).

---

## 🌐 Deployment Notes

Production build and start (run in each of `frontend`, `backend/user`, `backend/chat`, `backend/mail`):
```bash
npm ci
npm run build
npm start          # frontend: npm start -- -p 3000
```

When deploying to production:
1.  **Frontend API URLs**: `NEXT_PUBLIC_USER_SERVICE` and `NEXT_PUBLIC_CHAT_SERVICE` are baked in at build time, so set them before `npm run build`. They can be absolute URLs or same-origin path prefixes behind a reverse proxy (e.g. `/__devin/port/5002`); the socket.io client uses `<prefix>/socket.io` as its path.
2.  **CORS**: `FRONTEND_URL` in `backend/user/.env` and `backend/chat/.env` is a comma-separated allowlist of origins. Include your deployed frontend URL, plus any origin your proxy rewrites requests to (e.g. `http://localhost:5000,http://localhost:5002`).
3.  **Infrastructure**: MongoDB, Redis and RabbitMQ must be reachable from the backends (`MONGO_URI`, `REDIS_URL`, `RABBITMQ_*`).
