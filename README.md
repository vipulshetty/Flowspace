# Flowspace

A collaborative virtual workspace platform featuring fully customizable spaces and seamless proximity-based video chat.

## ‚ú® Features

- **Customizable Spaces** - Design your virtual workspace using intuitive tile-based editor
- **Proximity Video Chat** - Auto-connect with nearby colleagues 
- **Private Area Video Chat** - Designated zones for focused meetings
- **Real-time Multiplayer** - Live synchronization of all user activities
- **Advanced Analytics** - Heatmaps, presence tracking, and activity feeds
- **Custom Avatars** - Personalize your character appearance
- **Multi-Room Support** - Create complex layouts with teleporters

Built with modern technologies: Next.js, MongoDB, Redis, Socket.io, TailwindCSS, Pixi.js, and Agora RTC.

## Ì∫Ä Getting Started

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

## ‚öôÔ∏è Configuration

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

## ÌæÆ Running the Application

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

## ÌøóÔ∏è Tech Stack

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
- **Passport.js** - Authentication
- **JWT** - Token-based auth

## Ì≥ù License

MIT

---

**Built by [@vipulshetty](https://github.com/vipulshetty)**
