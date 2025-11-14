import { Router } from "express";
import {
  GetPlayersInRoom,
  GetServerName,
  IsOwnerOfServer,
  UserIsInGuild,
  GetChannelName,
  GetPlayerCounts,
  GetPresence,
  GetActivityFeed,
  GetHeatmapRequest,
  GetLastSeenRequest,
} from "./route-types";
import { verifyToken } from "../middleware/auth";
import { z } from "zod";
import { sessionManager } from "../session";
import { getOnlinePlayers } from "../services/presenceService";
import { getRecentActivity } from "../services/activityService";
import { getHeatmap } from "../services/heatmapService";
import { getLastSeen } from "../services/lastSeenService";

export default function routes(): Router {
  const router = Router();

  router.get("/getPlayersInRoom", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const params = req.query as unknown as z.infer<typeof GetPlayersInRoom>;
    if (!GetPlayersInRoom.safeParse(params).success) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const user = verifyToken(access_token);

    if (!user) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const session = sessionManager.getPlayerSession(user.id);
    if (!session) {
      return res.status(400).json({ message: "User not in a realm." });
    }

    const players = session.getPlayersInRoom(params.roomIndex);
    return res.json({ players });
  });

  router.get("/getPlayerCounts", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    let params = req.query as unknown as z.infer<typeof GetPlayerCounts>;
    const parseResults = GetPlayerCounts.safeParse(params);
    if (!parseResults.success) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    params = parseResults.data;

    if (params.realmIds.length > 100) {
      return res.status(400).json({ message: "Too many server IDs" });
    }

    const user = verifyToken(access_token);

    if (!user) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const playerCounts: number[] = [];
    for (const realmId of params.realmIds) {
      const session = sessionManager.getSession(realmId);
      if (session) {
        const playerCount = session.getPlayerCount();

        playerCounts.push(playerCount);
      } else {
        playerCounts.push(0);
      }
    }

    return res.json({ playerCounts });
  });

  router.get("/presence/online", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const parseResult = GetPresence.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const user = verifyToken(access_token);
    if (!user) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const session = sessionManager.getPlayerSession(user.id);
    if (!session || session.id !== parseResult.data.realmId) {
      return res.status(403).json({ message: "Not in this realm" });
    }

    try {
      const players = await getOnlinePlayers(parseResult.data.realmId);
      return res.json({ players });
    } catch (error) {
      console.error("Failed to fetch presence", error);
      return res.status(500).json({ message: "Failed to load presence" });
    }
  });

  router.get("/activity/recent", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const parseResult = GetActivityFeed.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const user = verifyToken(access_token);
    if (!user) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const session = sessionManager.getPlayerSession(user.id);
    if (!session || session.id !== parseResult.data.realmId) {
      return res.status(403).json({ message: "Not in this realm" });
    }

    try {
      const events = await getRecentActivity(
        parseResult.data.realmId,
        parseResult.data.limit ?? 20,
      );
      return res.json({ events });
    } catch (error) {
      console.error("Failed to fetch activity", error);
      return res.status(500).json({ message: "Failed to load activity" });
    }
  });

  router.get("/heatmap", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const parseResult = GetHeatmapRequest.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const user = verifyToken(access_token);
    if (!user) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const session = sessionManager.getPlayerSession(user.id);
    if (!session || session.id !== parseResult.data.realmId) {
      return res.status(403).json({ message: "Not in this realm" });
    }

    try {
      const heatmap = await getHeatmap(
        parseResult.data.realmId,
        parseResult.data.roomIndex,
      );
      return res.json({ heatmap });
    } catch (error) {
      console.error("Failed to fetch heatmap", error);
      return res.status(500).json({ message: "Failed to load heatmap" });
    }
  });

  router.get("/players/last-seen", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const parseResult = GetLastSeenRequest.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const user = verifyToken(access_token);
    if (!user) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    if (user.id !== parseResult.data.uid) {
      return res.status(403).json({ message: "Can only view your own last seen" });
    }

    try {
      const record = await getLastSeen(parseResult.data.uid);
      return res.json({ record });
    } catch (error) {
      console.error("Failed to fetch last seen", error);
      return res.status(500).json({ message: "Failed to load last seen" });
    }
  });

  return router;
}
