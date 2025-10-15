import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createAccessToken, createLiveKitRoom, deleteLiveKitRoom } from "./livekit";
import multer from "multer";
import { randomUUID } from "crypto";
import { insertMessageSchema, insertRoomSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new room
  app.post("/api/rooms", async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      
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

  // Get user rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const rooms = await storage.getUserRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ error: "Failed to fetch rooms" });
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

  // Generate LiveKit access token
  app.post("/api/rooms/:id/token", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      const { participantName } = req.body;
      if (!participantName) {
        return res.status(400).json({ error: "participantName is required" });
      }
      
      const token = createAccessToken(room.livekitRoomName, participantName);
      
      res.json({ 
        token,
        url: process.env.LIVEKIT_URL,
        roomName: room.livekitRoomName
      });
    } catch (error) {
      console.error("Error generating token:", error);
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

  // Get messages for a room
  app.get("/api/messages", async (req, res) => {
    try {
      const roomId = req.query.roomId as string;
      
      // For now, return demo messages since we don't have a room yet
      const demoMessages = [
        {
          id: randomUUID(),
          roomId: roomId || "demo",
          sender: "agent",
          content: "Hello! I'm your AI agent. How can I help you today?",
          type: "text",
          metadata: null,
          createdAt: new Date(Date.now() - 60000),
        },
      ];
      
      if (!roomId) {
        return res.json(demoMessages);
      }
      
      const messages = await storage.getRoomMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a text message
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        roomId: req.body.roomId || "demo-room",
      });
      
      const message = await storage.createMessage(validatedData);
      
      // Simulate agent response
      setTimeout(async () => {
        await storage.createMessage({
          roomId: message.roomId,
          sender: "agent",
          content: `I received your message: "${message.content}". I'm processing it now with my AI capabilities.`,
          type: "text",
          metadata: null,
        });
      }, 1500);
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Upload an image message
  app.post("/api/messages/image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      const roomId = req.body.roomId || "demo-room";
      
      // Convert image to base64
      const base64Image = req.file.buffer.toString("base64");
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      
      const message = await storage.createMessage({
        roomId,
        sender: "user",
        content: "Shared an image",
        type: "image",
        metadata: {
          imageUrl,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      });
      
      // Simulate agent image analysis response
      setTimeout(async () => {
        await storage.createMessage({
          roomId: message.roomId,
          sender: "agent",
          content: "I've analyzed the image you shared. It appears to be a screenshot or image. In a full implementation, I would use vision AI to provide detailed analysis of the visual content.",
          type: "text",
          metadata: null,
        });
      }, 2000);
      
      res.json(message);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Get agent session status
  app.get("/api/agent/status/:roomId", async (req, res) => {
    try {
      const session = await storage.getAgentSession(req.params.roomId);
      if (!session) {
        return res.json({ status: "idle" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching agent status:", error);
      res.status(500).json({ error: "Failed to fetch agent status" });
    }
  });

  // Create agent session
  app.post("/api/agent/session", async (req, res) => {
    try {
      const { roomId } = req.body;
      if (!roomId) {
        return res.status(400).json({ error: "roomId is required" });
      }
      
      const session = await storage.createAgentSession({
        roomId,
        status: "initializing",
        metadata: {},
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating agent session:", error);
      res.status(500).json({ error: "Failed to create agent session" });
    }
  });

  // Platform API integration endpoint (for feeding data to agent)
  app.post("/api/platform/data", async (req, res) => {
    try {
      const { userId, endpoint, data } = req.body;
      
      // This endpoint will be used to feed platform data to the agent
      // For now, just acknowledge receipt
      res.json({ 
        success: true, 
        message: "Platform data received and will be made available to the agent" 
      });
    } catch (error) {
      console.error("Error processing platform data:", error);
      res.status(500).json({ error: "Failed to process platform data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
