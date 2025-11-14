import { Server } from "socket.io";
import {
  JoinRealm,
  Disconnect,
  OnEventCallback,
  MovePlayer,
  Teleport,
  ChangedSkin,
  NewMessage,
  UpdateStatus,
  Heartbeat,
  ActivityEvent,
  TrackPosition,
} from "./socket-types";
import { z } from "zod";
import { verifyToken } from "../middleware/auth";
import { User } from "../db/models/User";
import { Realm } from "../db/models/Realm";
import { users } from "../Users";
import { sessionManager } from "../session";
import { removeExtraSpaces } from "../utils";
import { kickPlayer } from "./helpers";
import { formatEmailToName } from "../utils";
import { normalizeSkin } from "../utils/skins";
import {
  recordPresence,
  markPlayerOffline,
  getOnlinePlayers,
  updatePlayerStatus as persistPlayerStatus,
} from "../services/presenceService";
import { recordActivity } from "../services/activityService";
import type { ActivityRecord } from "../services/activityService";
import { trackHeatmapSample } from "../services/heatmapService";
import { updateLastSeen } from "../services/lastSeenService";

const joiningInProgress = new Set<string>();

function protectConnection(io: Server) {
  io.use(async (socket, next) => {
    const access_token =
      socket.handshake.headers["authorization"]?.split(" ")[1];
    const uid = socket.handshake.query.uid as string;
    if (!access_token || !uid) {
      const error = new Error("Invalid access token or uid.");
      return next(error);
    } else {
      const decoded = verifyToken(access_token);
      if (!decoded) {
        return next(new Error("Invalid access token."));
      }
      if (decoded.id !== uid) {
        return next(new Error("Invalid uid."));
      }

      const user = await User.findById(uid);
      if (!user) {
        return next(new Error("User not found."));
      }

      // Add user to users manager (converting to Supabase-like format for compatibility)
      users.addUser(uid, {
        id: user._id.toString(),
        email: user.email,
        aud: "authenticated",
        role: "authenticated",
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      } as any);
      next();
    }
  });
}

export function sockets(io: Server) {
  protectConnection(io);

  // Handle a connection
  io.on("connection", (socket) => {
    function on(
      eventName: string,
      schema: z.ZodTypeAny,
      callback: OnEventCallback,
    ) {
      socket.on(eventName, (data: any) => {
        const result = schema.safeParse(data);
        if (!result.success) {
          return;
        }

        const session = sessionManager.getPlayerSession(
          socket.handshake.query.uid as string,
        );
        if (!session) {
          return;
        }
        Promise.resolve(callback({ session, data: result.data }))
          .catch((error) => {
            console.error(`Error handling socket event "${eventName}"`, error);
          });
      });
    }

    function emit(eventName: string, data: any) {
      const session = sessionManager.getPlayerSession(
        socket.handshake.query.uid as string,
      );
      if (!session) {
        return;
      }

      const room = session.getPlayerRoom(socket.handshake.query.uid as string);
      const players = session.getPlayersInRoom(room);

      for (const player of players) {
        if (player.socketId === socket.id) continue;

        io.to(player.socketId).emit(eventName, data);
      }
    }

    function emitToSocketIds(
      socketIds: string[],
      eventName: string,
      data: any,
    ) {
      for (const socketId of socketIds) {
        io.to(socketId).emit(eventName, data);
      }
    }

    async function broadcastPresenceUpdate(realmId: string) {
      try {
        const players = await getOnlinePlayers(realmId);
        io.to(realmId).emit("onlinePlayersUpdate", players);
      } catch (error) {
        console.error("Failed to broadcast presence update", error);
      }
    }

    function broadcastActivity(realmId: string, activity: ActivityRecord | null) {
      if (!activity) return;
      io.to(realmId).emit("activityEvent", activity);
    }

    socket.on("joinRealm", async (realmData: z.infer<typeof JoinRealm>) => {
      const uid = socket.handshake.query.uid as string;
      const rejectJoin = (reason: string) => {
        socket.emit("failedToJoinRoom", reason);
        joiningInProgress.delete(uid);
      };

      if (JoinRealm.safeParse(realmData).success === false) {
        return rejectJoin("Invalid request data.");
      }

      if (joiningInProgress.has(uid)) {
        rejectJoin("Already joining a space.");
      }
      joiningInProgress.add(uid);

      const session = sessionManager.getSession(realmData.realmId);
      if (session) {
        const playerCount = session.getPlayerCount();
        if (playerCount >= 30) {
          return rejectJoin("Space is full. It's 30 players max.");
        }
      }

      const realm = await Realm.findById(realmData.realmId);

      if (!realm) {
        return rejectJoin("Space not found.");
      }

      const user = await User.findById(uid);
      if (!user) {
        return rejectJoin("Failed to get profile.");
      }

      const join = async () => {
        try {
        if (!sessionManager.getSession(realmData.realmId)) {
          sessionManager.createSession(realmData.realmId, realm.map_data);
        }

        const currentSession = sessionManager.getPlayerSession(uid);
        if (currentSession) {
          kickPlayer(uid, "You have logged in from another location.");
        }

        const currentUser = users.getUser(uid)!;
        const username = formatEmailToName(user.email);
        const normalizedSkin = normalizeSkin(user.skin);
        if (user.skin !== normalizedSkin) {
          user.skin = normalizedSkin;
          await user.save();
        }
        sessionManager.addPlayerToSession(
          socket.id,
          realmData.realmId,
          uid,
          username,
          normalizedSkin,
        );
        const newSession = sessionManager.getPlayerSession(uid);
        const player = newSession.getPlayer(uid);

        socket.join(realmData.realmId);
        socket.emit("joinedRealm");
        emit("playerJoinedRoom", player);
        await recordPresence({
          realmId: realmData.realmId,
          uid,
          username,
          roomIndex: player.room,
          status: player.status,
          x: player.x,
          y: player.y,
        });

        await updateLastSeen({
          uid,
          realmId: realmData.realmId,
          roomIndex: player.room,
          x: player.x,
          y: player.y,
        });

        const activity = await recordActivity({
          realmId: realmData.realmId,
          uid,
          username,
          roomIndex: player.room,
          roomName:
            newSession.map_data.rooms[player.room]?.name ??
            `Room ${player.room + 1}`,
          action: "joined",
          timestamp: Date.now(),
        });
        broadcastActivity(realmData.realmId, activity);
        await broadcastPresenceUpdate(realmData.realmId);
        } finally {
          joiningInProgress.delete(uid);
        }
      };

      if (realm.owner_id === socket.handshake.query.uid) {
        return join();
      }

      if (realm.only_owner) {
        return rejectJoin("This realm is private right now. Come back later!");
      }

      if (realm.share_id === realmData.shareId) {
        return join();
      } else {
        return rejectJoin("The share link has been changed.");
      }
    });

    // Handle a disconnection
    on("disconnect", Disconnect, async ({ session }) => {
      const uid = socket.handshake.query.uid as string;
      const player = session.getPlayer(uid);
      const roomIndex = player?.room ?? session.map_data.spawnpoint.roomIndex;
      const socketIds = sessionManager.getSocketIdsInRoom(
        session.id,
        roomIndex,
      );
      const success = sessionManager.logOutBySocketId(socket.id);
      if (success) {
        emitToSocketIds(socketIds, "playerLeftRoom", uid);
        users.removeUser(uid);

        if (player) {
          await markPlayerOffline(session.id, uid);
          await updateLastSeen({
            uid,
            realmId: session.id,
            roomIndex: player.room,
            x: player.x,
            y: player.y,
          });
          const activity = await recordActivity({
            realmId: session.id,
            uid,
            username: player.username,
            roomIndex: player.room,
            roomName:
              session.map_data.rooms[player.room]?.name ??
              `Room ${player.room + 1}`,
            action: "departed",
            timestamp: Date.now(),
          });
          broadcastActivity(session.id, activity);
        }

        await broadcastPresenceUpdate(session.id);
      }
    });

    on("movePlayer", MovePlayer, async ({ session, data }) => {
      const player = session.getPlayer(socket.handshake.query.uid as string);
      if (!player) return;
      const changedPlayers = session.movePlayer(player.uid, data.x, data.y);

      emit("playerMoved", {
        uid: player.uid,
        x: player.x,
        y: player.y,
      });

      for (const uid of changedPlayers) {
        const changedPlayerData = session.getPlayer(uid);

        emitToSocketIds([changedPlayerData.socketId], "proximityUpdate", {
          proximityId: changedPlayerData.proximityId,
        });
      }

      await recordPresence({
        realmId: session.id,
        uid: player.uid,
        username: player.username,
        roomIndex: player.room,
        status: player.status,
        x: player.x,
        y: player.y,
      });

      await updateLastSeen({
        uid: player.uid,
        realmId: session.id,
        roomIndex: player.room,
        x: player.x,
        y: player.y,
      });
    });

    on("teleport", Teleport, async ({ session, data }) => {
      const uid = socket.handshake.query.uid as string;
      const player = session.getPlayer(uid);
      if (!player) return;

      if (player.room !== data.roomIndex) {
        emit("playerLeftRoom", uid);
        const changedPlayers = session.changeRoom(
          uid,
          data.roomIndex,
          data.x,
          data.y,
        );
        emit("playerJoinedRoom", player);

        for (const changedUid of changedPlayers) {
          const changedPlayerData = session.getPlayer(changedUid);

          emitToSocketIds(
            [changedPlayerData.socketId],
            "proximityUpdate",
            {
              proximityId: changedPlayerData.proximityId,
            },
          );
        }
      } else {
        const changedPlayers = session.movePlayer(player.uid, data.x, data.y);
        emit("playerTeleported", { uid, x: player.x, y: player.y });

        for (const changedUid of changedPlayers) {
          const changedPlayerData = session.getPlayer(changedUid);

          emitToSocketIds(
            [changedPlayerData.socketId],
            "proximityUpdate",
            {
              proximityId: changedPlayerData.proximityId,
            },
          );
        }
      }

      await recordPresence({
        realmId: session.id,
        uid: player.uid,
        username: player.username,
        roomIndex: player.room,
        status: player.status,
        x: player.x,
        y: player.y,
      });

      await updateLastSeen({
        uid: player.uid,
        realmId: session.id,
        roomIndex: player.room,
        x: player.x,
        y: player.y,
      });

      const activity = await recordActivity({
        realmId: session.id,
        uid: player.uid,
        username: player.username,
        roomIndex: player.room,
        roomName:
          session.map_data.rooms[player.room]?.name ??
          `Room ${player.room + 1}`,
        action: "teleported",
        timestamp: Date.now(),
      });
      broadcastActivity(session.id, activity);
    });

    on("changedSkin", ChangedSkin, async ({ session, data }) => {
      const uid = socket.handshake.query.uid as string;
      const player = session.getPlayer(uid);
      if (!player) return;

      const normalizedSkin = normalizeSkin(data);
      if (player.skin === normalizedSkin) {
        return;
      }

      player.skin = normalizedSkin;
      emit("playerChangedSkin", { uid, skin: player.skin });

      try {
        await User.findByIdAndUpdate(uid, { skin: normalizedSkin }).exec();
      } catch (error) {
        console.error("Failed to persist skin change", error);
      }
    });

    on("sendMessage", NewMessage, ({ session, data }) => {
      // cannot exceed 300 characters
      if (data.length > 300 || data.trim() === "") return;

      const message = removeExtraSpaces(data);

      const uid = socket.handshake.query.uid as string;
      emit("receiveMessage", { uid, message });
    });

    on("updateStatus", UpdateStatus, async ({ session, data }) => {
      const uid = socket.handshake.query.uid as string;
      const player = session.getPlayer(uid);
      if (!player) return;

      player.status = data.status;
      emit("playerStatusChanged", { uid: player.uid, status: player.status });

      await persistPlayerStatus(session.id, player.uid, player.status);
      await recordPresence({
        realmId: session.id,
        uid: player.uid,
        username: player.username,
        roomIndex: player.room,
        status: player.status,
        x: player.x,
        y: player.y,
      });
      await broadcastPresenceUpdate(session.id);
    });

    on("heartbeat", Heartbeat, async ({ session }) => {
      const uid = socket.handshake.query.uid as string;
      const player = session.getPlayer(uid);
      if (!player) return;

      await recordPresence({
        realmId: session.id,
        uid: player.uid,
        username: player.username,
        roomIndex: player.room,
        status: player.status,
        x: player.x,
        y: player.y,
      });

      await broadcastPresenceUpdate(session.id);
    });

    on("activity", ActivityEvent, async ({ session, data }) => {
      const uid = socket.handshake.query.uid as string;
      const player = session.getPlayer(uid);
      if (!player) return;

      const roomIndex = data.roomIndex ?? player.room;
      const activity = await recordActivity({
        realmId: session.id,
        uid: player.uid,
        username: player.username,
        roomIndex,
        roomName:
          data.roomName ??
          session.map_data.rooms[roomIndex]?.name ??
            `Room ${roomIndex + 1}`,
        action: data.action,
        timestamp: Date.now(),
      });

      broadcastActivity(session.id, activity);
    });

    on("trackPosition", TrackPosition, async ({ session, data }) => {
      const uid = socket.handshake.query.uid as string;
      const player = session.getPlayer(uid);
      if (!player) return;

      await trackHeatmapSample(
        session.id,
        data.roomIndex,
        data.x,
        data.y,
      );

      await updateLastSeen({
        uid: player.uid,
        realmId: session.id,
        roomIndex: data.roomIndex,
        x: data.x,
        y: data.y,
      });
    });
  });
}
