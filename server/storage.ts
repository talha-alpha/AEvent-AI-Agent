import type { Room, CreateRoom } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getRoom(id: string): Promise<Room | undefined>;
  getRoomByLivekitName(livekitRoomName: string): Promise<Room | undefined>;
  createRoom(room: CreateRoom & { livekitRoomName: string }): Promise<Room>;
  updateRoomStatus(id: string, status: "active" | "ended"): Promise<void>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomByLivekitName(livekitRoomName: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(
      (room) => room.livekitRoomName === livekitRoomName,
    );
  }

  async createRoom(data: CreateRoom & { livekitRoomName: string }): Promise<Room> {
    const id = randomUUID();
    const room: Room = { 
      ...data, 
      id,
      status: "active",
      createdAt: new Date(),
      endedAt: null
    };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoomStatus(id: string, status: "active" | "ended"): Promise<void> {
    const room = this.rooms.get(id);
    if (room) {
      room.status = status;
      if (status === "ended") {
        room.endedAt = new Date();
      }
    }
  }
}

export const storage = new MemStorage();
