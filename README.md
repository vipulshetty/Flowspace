# Gather Clone

[Watch the demo](https://www.youtube.com/watch?v=AnhsC7Fmt20)

A clone of Gather.town featuring fully customizable spaces and seamless proximity based video chat.

The project is a fork of Realms, my previous project inspired by Gather. You can check it out [here.](https://github.com/trevorwrightdev/realms)

The app was designed to include the core features of Gather, including:

- Customizable spaces using tilesets
- Proximity video chat
- Private area video chat 
- Multiplayer networking
- Tile-based movement

Built as a TypeScript web app primarily using Next.js, Supabase, Socket.io, TailwindCSS, Pixi.js, and Agora for video chat. 

### How to install

### Installation

First, clone the repo:
```bash
git clone https://github.com/vipulshetty/Flowspace.git
cd Flowspace
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Backend Setup
```bash
cd backend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Redis
REDIS_URL=your_redis_url

# JWT Secret
JWT_SECRET=your_secret_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# API Endpoints
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Agora Video Chat
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
APP_CERTIFICATE=your_agora_certificate
```

## 🎮 Running the Application

Start both servers:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Pixi.js** - 2D WebGL rendering
- **Phaser 3** - Game engine for character animations
- **Three.js** - 3D effects and post-processing
- **TailwindCSS** - Utility-first CSS
- **Socket.io Client** - Real-time communication
- **Agora RTC** - Video/audio chat

### Backend
- **Express.js** - Node.js web framework
- **Socket.io** - WebSocket server
- **MongoDB** - Primary database with Change Streams
- **Redis** - Caching and real-time data
- **Passport.js** - Authentication with Google OAuth
- **JWT** - Token-based auth

## 📝 License

MIT

---

**Built by [@vipulshetty](https://github.com/vipulshetty)**
