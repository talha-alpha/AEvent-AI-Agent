import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createAccessToken, createLiveKitRoom, deleteLiveKitRoom } from "./livekit";
import { randomUUID } from "crypto";
import { createRoomSchema, tokenRequestSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new room
  app.post("/api/rooms", async (req, res) => {
    try {
      // Check if LiveKit is configured
      const hasLiveKitConfig = process.env.LIVEKIT_URL?.trim() && 
                                process.env.LIVEKIT_API_KEY?.trim() && 
                                process.env.LIVEKIT_API_SECRET?.trim();
      if (!hasLiveKitConfig) {
        return res.status(503).json({ 
          error: "LiveKit is not configured", 
          message: "Please configure LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables to enable AI agent functionality." 
        });
      }
      
      const validatedData = createRoomSchema.parse(req.body);
      
      const livekitRoomName = `room-${randomUUID()}`;
      
      // Create LiveKit room
      await createLiveKitRoom(livekitRoomName);
      
      // Create room in storage
      const room = await storage.createRoom({
        ...validatedData,
        livekitRoomName,
      });
      
      res.json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  // Get room by ID
  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  // End a room
  app.post("/api/rooms/:id/end", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      await storage.updateRoomStatus(req.params.id, "ended");
      await deleteLiveKitRoom(room.livekitRoomName);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error ending room:", error);
      res.status(500).json({ error: "Failed to end room" });
    }
  });

  // Get LiveKit access token
  app.post("/api/token", async (req, res) => {
    try {
      // Check if LiveKit is configured
      const hasLiveKitConfig = process.env.LIVEKIT_URL?.trim() && 
                                process.env.LIVEKIT_API_KEY?.trim() && 
                                process.env.LIVEKIT_API_SECRET?.trim();
      if (!hasLiveKitConfig) {
        return res.status(503).json({ 
          error: "LiveKit is not configured", 
          message: "Please configure LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables to enable AI agent functionality." 
        });
      }
      
      const { roomName, participantName } = tokenRequestSchema.parse(req.body);
      
      const token = await createAccessToken(roomName, participantName);
      
      res.json({ 
        token,
        url: process.env.LIVEKIT_URL 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating token:", error);
      res.status(500).json({ error: "Failed to create token" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
