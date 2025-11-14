import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { sockets } from "./sockets/sockets";
import routes from "./routes/routes";
import authRoutes from "./routes/auth";
import realmsRoutes from "./routes/realms";
import { connectToDatabase } from "./db/mongodb";
import { Realm } from "./db/models/Realm";
import { sessionManager } from "./session";
import passport from "passport";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

app.use("/auth", authRoutes);
app.use("/realms", realmsRoutes);
app.use(routes());

sockets(io);

// Setup MongoDB Change Streams for realtime updates
function setupChangeStreams() {
  try {
    const changeStream = Realm.watch();

    changeStream.on("change", (change: any) => {
      if (change.operationType === "update") {
        const id = change.documentKey._id.toString();
        const updatedFields = change.updateDescription?.updatedFields || {};

        let refresh = false;
        if (updatedFields.map_data !== undefined) {
          refresh = true;
        }
        if (updatedFields.share_id !== undefined) {
          refresh = true;
        }
        if (updatedFields.only_owner !== undefined) {
          refresh = true;
        }

        if (refresh) {
          sessionManager.terminateSession(
            id,
            "This realm has been changed by the owner.",
          );
        }
      } else if (change.operationType === "delete") {
        const id = change.documentKey._id.toString();
        sessionManager.terminateSession(
          id,
          "This realm is no longer available.",
        );
      }
    });

    changeStream.on("error", (error: any) => {
      console.error("Change stream error:", error);
    });

    console.log("MongoDB Change Streams initialized");
  } catch (error) {
    console.warn(
      "Could not initialize Change Streams (requires replica set):",
      error,
    );
  }
}

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Setup change streams (optional - requires replica set)
    setupChangeStreams();

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export { io };
