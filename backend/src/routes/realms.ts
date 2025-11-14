import { Router, Response } from "express";
import { Realm } from "../db/models/Realm";
import { User } from "../db/models/User";
import { authenticateToken } from "../middleware/auth";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Validation schemas
const CreateRealmSchema = z.object({
  name: z.string().min(1).max(100),
  map_data: z.any(),
  only_owner: z.boolean().optional().default(false),
});

const UpdateRealmSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  map_data: z.any().optional(),
  only_owner: z.boolean().optional(),
});

const UpdateVisitedRealmsSchema = z.object({
  share_id: z.string(),
});

// POST /realms - Create a new realm
router.post("/", authenticateToken, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if user already has a virtual office
    const existingRealm = await Realm.findOne({ owner_id: req.user.id });
    if (existingRealm) {
      return res.status(400).json({
        error: "You already have a virtual office. Each user can only have one virtual office.",
        existingRealmId: existingRealm._id.toString(),
      });
    }

    const result = CreateRealmSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid realm data" });
    }

    const { name, map_data, only_owner } = result.data;

    // Generate unique share_id
    const share_id = uuidv4();

    const realm = new Realm({
      owner_id: req.user.id,
      share_id,
      name,
      map_data,
      only_owner,
    });

    await realm.save();

    res.status(201).json({
      realm: {
        id: realm._id.toString(),
        owner_id: realm.owner_id,
        share_id: realm.share_id,
        name: realm.name,
        map_data: realm.map_data,
        only_owner: realm.only_owner,
      },
    });
  } catch (error: any) {
    console.error("Create realm error:", error);
    res.status(500).json({ error: "Failed to create realm" });
  }
});

// GET /realms/:id - Get realm by ID
router.get(
  "/:id",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const realm = await Realm.findById(req.params.id);

      if (!realm) {
        return res.status(404).json({ error: "Realm not found" });
      }

      res.status(200).json({
        realm: {
          id: realm._id.toString(),
          owner_id: realm.owner_id,
          share_id: realm.share_id,
          name: realm.name,
          map_data: realm.map_data,
          only_owner: realm.only_owner,
        },
      });
    } catch (error: any) {
      console.error("Get realm error:", error);
      res.status(500).json({ error: "Failed to get realm" });
    }
  },
);

// GET /realms/share/:shareId - Get realm by share ID
  router.get(
    "/share/:shareId",
    authenticateToken,
    async (req: any, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const realm = await Realm.findOne({ share_id: req.params.shareId });

      if (!realm) {
        return res.status(404).json({ error: "Realm not found" });
      }

      res.status(200).json({
        realm: {
          id: realm._id.toString(),
          owner_id: realm.owner_id,
          share_id: realm.share_id,
          name: realm.name,
          map_data: realm.map_data,
          only_owner: realm.only_owner,
        },
      });
    } catch (error: any) {
      console.error("Get realm by share ID error:", error);
      res.status(500).json({ error: "Failed to get realm" });
    }
  },
);

// GET /realms/user/owned - Get all realms owned by the current user
  router.get(
    "/user/owned",
    authenticateToken,
    async (req: any, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const realms = await Realm.find({ owner_id: req.user.id })
        .sort({ createdAt: -1 })
        .limit(100);

      res.status(200).json({
        realms: realms.map((realm) => ({
          id: realm._id.toString(),
          owner_id: realm.owner_id,
          share_id: realm.share_id,
          name: realm.name,
          only_owner: realm.only_owner,
          createdAt: realm.createdAt,
        })),
      });
    } catch (error: any) {
      console.error("Get owned realms error:", error);
      res.status(500).json({ error: "Failed to get realms" });
    }
  },
);

// PUT /realms/:id - Update a realm (DISABLED - Fixed office layout)
  router.put(
    "/:id",
    authenticateToken,
    async (req: any, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Office layouts are now fixed and cannot be edited
      return res.status(403).json({ 
        error: "Office layouts are fixed and cannot be customized" 
      });

      /* Original update logic disabled
      const result = UpdateRealmSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid realm data" });
      }

      const realm = await Realm.findOne({
        _id: req.params.id,
        owner_id: req.user.id,
      });

      if (!realm) {
        return res
          .status(404)
          .json({ error: "Realm not found or not authorized" });
      }

      // Update fields
      if (result.data.name !== undefined) {
        realm.name = result.data.name;
      }
      if (result.data.map_data !== undefined) {
        realm.map_data = result.data.map_data;
      }
      if (result.data.only_owner !== undefined) {
        realm.only_owner = result.data.only_owner;
      }

      await realm.save();

      res.status(200).json({
        realm: {
          id: realm._id.toString(),
          owner_id: realm.owner_id,
          share_id: realm.share_id,
          name: realm.name,
          map_data: realm.map_data,
          only_owner: realm.only_owner,
        },
      });
      */
    } catch (error: any) {
      console.error("Update realm error:", error);
      res.status(500).json({ error: "Failed to update realm" });
    }
  },
);

// DELETE /realms/:id - Delete a realm (DISABLED - Office is permanent)
  router.delete(
    "/:id",
    authenticateToken,
    async (req: any, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Virtual offices are permanent and cannot be deleted
      return res.status(403).json({ 
        error: "Virtual offices are permanent and cannot be deleted" 
      });

      /* Original delete logic disabled
      const realm = await Realm.findOneAndDelete({
        _id: req.params.id,
        owner_id: req.user.id,
      });

      if (!realm) {
        return res
          .status(404)
          .json({ error: "Realm not found or not authorized" });
      }

      res.status(200).json({ message: "Realm deleted successfully" });
      */
    } catch (error: any) {
      console.error("Delete realm error:", error);
      res.status(500).json({ error: "Failed to delete realm" });
    }
  },
);

// POST /realms/regenerate-share/:id - Regenerate share ID for a realm
  router.post(
    "/regenerate-share/:id",
    authenticateToken,
    async (req: any, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const realm = await Realm.findOne({
        _id: req.params.id,
        owner_id: req.user.id,
      });

      if (!realm) {
        return res
          .status(404)
          .json({ error: "Realm not found or not authorized" });
      }

      // Generate new share_id
      realm.share_id = uuidv4();
      await realm.save();

      res.status(200).json({
        share_id: realm.share_id,
      });
    } catch (error: any) {
      console.error("Regenerate share ID error:", error);
      res.status(500).json({ error: "Failed to regenerate share ID" });
    }
  },
);

// POST /realms/visited - Update visited realms for user
  router.post(
    "/visited",
    authenticateToken,
    async (req: any, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = UpdateVisitedRealmsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data" });
      }

      const { share_id } = result.data;

      // Verify realm exists
      const realm = await Realm.findOne({ share_id });
      if (!realm) {
        return res.status(404).json({ error: "Realm not found" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Add to visited realms if not already there
      if (!user.visited_realms.includes(share_id)) {
        user.visited_realms.unshift(share_id);
        // Keep only last 50 visited realms
        user.visited_realms = user.visited_realms.slice(0, 50);
        await user.save();
      }

      res.status(200).json({ message: "Visited realms updated" });
    } catch (error: any) {
      console.error("Update visited realms error:", error);
      res.status(500).json({ error: "Failed to update visited realms" });
    }
  },
);

// GET /realms/visited/list - Get visited realms for current user
  router.get(
    "/visited/list",
    authenticateToken,
    async (req: any, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const visitedRealms: Array<{
        id: string;
        name: string;
        share_id: string;
      }> = [];
      const realmsToRemove: string[] = [];

      for (const share_id of user.visited_realms) {
        const realm = await Realm.findOne({ share_id });
        if (realm) {
          visitedRealms.push({
            id: realm._id.toString(),
            name: realm.name,
            share_id: realm.share_id,
          });
        } else {
          realmsToRemove.push(share_id);
        }
      }

      // Clean up invalid realm references
      if (realmsToRemove.length > 0) {
        user.visited_realms = user.visited_realms.filter(
          (id: string) => !realmsToRemove.includes(id),
        );
        await user.save();
      }

      res.status(200).json({ realms: visitedRealms });
    } catch (error: any) {
      console.error("Get visited realms error:", error);
      res.status(500).json({ error: "Failed to get visited realms" });
    }
  },
);

export default router;
