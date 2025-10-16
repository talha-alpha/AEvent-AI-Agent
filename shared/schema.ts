import { z } from "zod";

// Agent status types
export type AgentStatus = "initializing" | "listening" | "thinking" | "speaking" | "idle";

// Room interface
export interface Room {
  id: string;
  name: string;
  livekitRoomName: string;
  status: "active" | "ended";
  createdAt: Date;
  endedAt?: Date | null;
}

// Room creation schema
export const createRoomSchema = z.object({
  name: z.string().min(1),
});

export type CreateRoom = z.infer<typeof createRoomSchema>;

// Token request schema
export const tokenRequestSchema = z.object({
  roomName: z.string(),
  participantName: z.string(),
});

export type TokenRequest = z.infer<typeof tokenRequestSchema>;
