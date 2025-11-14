# Flowspace# Gather Clone



A collaborative virtual workspace platform featuring fully customizable spaces and seamless proximity-based video chat.[Watch the demo](https://www.youtube.com/watch?v=AnhsC7Fmt20)



## ✨ FeaturesA clone of Gather.town featuring fully customizable spaces and seamless proximity based video chat.



- **Customizable Spaces** - Design your virtual workspace using intuitive tile-based editorThe project is a fork of Realms, my previous project inspired by Gather. You can check it out [here.](https://github.com/trevorwrightdev/realms)

- **Proximity Video Chat** - Auto-connect with nearby colleagues 

- **Private Area Video Chat** - Designated zones for focused meetingsThe app was designed to include the core features of Gather, including:

- **Real-time Multiplayer** - Live synchronization of all user activities

- **Advanced Analytics** - Heatmaps, presence tracking, and activity feeds- Customizable spaces using tilesets

- **Custom Avatars** - Personalize your character appearance- Proximity video chat

- **Multi-Room Support** - Create complex layouts with teleporters- Private area video chat 

- Multiplayer networking

Built with modern technologies: Next.js, MongoDB, Redis, Socket.io, TailwindCSS, Pixi.js, and Agora RTC.- Tile-based movement



## 🚀 Getting StartedBuilt as a TypeScript web app primarily using Next.js, Supabase, Socket.io, TailwindCSS, Pixi.js, and Agora for video chat. 



### Installation### How to install



First, clone the repo:### Installation

```bash

git clone https://github.com/vipulshetty/Flowspace.gitFirst, clone the repo:

cd Flowspace```bash

```git clone https://github.com/vipulshetty/Flowspace.git

cd Flowspace

### Frontend Setup```

```bash

cd frontend### Frontend Setup

npm install```bash

```cd frontend

npm install

### Backend Setup```

```bash

cd backend### Backend Setup

npm install```bash

```cd backend

npm install

## ⚙️ Configuration```



### Backend Environment Variables## ⚙️ Configuration



Create a `.env` file in the `backend` directory:### Backend Environment Variables



```envCreate a `.env` file in the `backend` directory:

# Server Configuration

FRONTEND_URL=http://localhost:3000```env

BACKEND_URL=http://localhost:3001# Server Configuration

FRONTEND_URL=http://localhost:3000

# MongoDBBACKEND_URL=http://localhost:3001

MONGODB_URI=your_mongodb_connection_string

# MongoDB

# RedisMONGODB_URI=your_mongodb_connection_string

REDIS_URL=your_redis_url

# Redis

# JWT SecretREDIS_URL=your_redis_url

JWT_SECRET=your_secret_key

# JWT Secret

# Google OAuth (Optional)JWT_SECRET=your_secret_key

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret# Google OAuth (Optional)

```GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

### Frontend Environment Variables```



Create a `.env.local` file in the `frontend` directory:### Frontend Environment Variables



```envCreate a `.env.local` file in the `frontend` directory:

# API Endpoints

NEXT_PUBLIC_BASE_URL=http://localhost:3000```env

NEXT_PUBLIC_BACKEND_URL=http://localhost:3001# API Endpoints

NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Agora Video ChatNEXT_PUBLIC_BACKEND_URL=http://localhost:3001

NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id

APP_CERTIFICATE=your_agora_certificate# Agora Video Chat

```NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id

APP_CERTIFICATE=your_agora_certificate

## 🎮 Running the Application```



Start both servers:## 🎮 Running the Application



**Backend:**Start both servers:

```bash

cd backend**Backend:**

npm run dev```bash

```cd backend

npm run dev

**Frontend:**```

```bash

cd frontend**Frontend:**

npm run dev```bash

```cd frontend

npm run dev

Visit `http://localhost:3000` to see the application.```



## 🏗️ Tech StackVisit `http://localhost:3000` to see the application.



### Frontend## 🏗️ Tech Stack

- **Next.js 14** - React framework with App Router

- **Pixi.js** - 2D WebGL rendering### Frontend

- **Phaser 3** - Game engine for character animations- **Next.js 14** - React framework with App Router

- **Three.js** - 3D effects and post-processing- **Pixi.js** - 2D WebGL rendering

- **TailwindCSS** - Utility-first CSS- **Phaser 3** - Game engine for character animations

- **Socket.io Client** - Real-time communication- **Three.js** - 3D effects and post-processing

- **Agora RTC** - Video/audio chat- **TailwindCSS** - Utility-first CSS

- **Socket.io Client** - Real-time communication

### Backend- **Agora RTC** - Video/audio chat

- **Express.js** - Node.js web framework

- **Socket.io** - WebSocket server### Backend

- **MongoDB** - Primary database with Change Streams- **Express.js** - Node.js web framework

- **Redis** - Caching and real-time data- **Socket.io** - WebSocket server

- **Passport.js** - Authentication- **MongoDB** - Primary database with Change Streams

- **JWT** - Token-based auth- **Redis** - Caching and real-time data

- **Passport.js** - Authentication with Google OAuth

## 📝 License- **JWT** - Token-based auth



MIT## 📝 License



---MIT



**Built by [@vipulshetty](https://github.com/vipulshetty)**---


**Built by [@vipulshetty](https://github.com/vipulshetty)**
