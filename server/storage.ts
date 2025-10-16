import type { Room, CreateRoom } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { env } from "./env";

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

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = neon(env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getRoom(id: string): Promise<Room | undefined> {
    const result = await this.db.select().from(rooms).where(eq(rooms.id, id));
    return result[0];
  }

  async getRoomByLivekitName(livekitRoomName: string): Promise<Room | undefined> {
    const result = await this.db.select().from(rooms).where(eq(rooms.livekitRoomName, livekitRoomName));
    return result[0];
  }

  async getUserRooms(userId: string): Promise<Room[]> {
    return await this.db.select().from(rooms).where(eq(rooms.userId, userId));
  }

  async createRoom(insertRoom: InsertRoom & { livekitRoomName: string }): Promise<Room> {
    const result = await this.db.insert(rooms).values(insertRoom).returning();
    return result[0];
  }

  async updateRoomStatus(id: string, status: string): Promise<void> {
    await this.db.update(rooms).set({ 
      status,
      endedAt: status === "ended" ? new Date() : null
    }).where(eq(rooms.id, id));
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const result = await this.db.select().from(messages).where(eq(messages.id, id));
    return result[0];
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    return await this.db.select().from(messages).where(eq(messages.roomId, roomId));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await this.db.insert(messages).values(insertMessage).returning();
    return result[0];
  }

  async getAgentSession(roomId: string): Promise<AgentSession | undefined> {
    const result = await this.db.select().from(agentSessions).where(eq(agentSessions.roomId, roomId));
    return result[0];
  }

  async createAgentSession(insertSession: InsertAgentSession): Promise<AgentSession> {
    const result = await this.db.insert(agentSessions).values(insertSession).returning();
    return result[0];
  }

  async updateAgentStatus(roomId: string, status: string): Promise<void> {
    await this.db.update(agentSessions).set({ 
      status,
      lastActivity: new Date()
    }).where(eq(agentSessions.roomId, roomId));
  }

  async getDataSource(id: string): Promise<DataSource | undefined> {
    const result = await this.db.select().from(dataSources).where(eq(dataSources.id, id));
    return result[0];
  }

  async getUserDataSources(userId: string): Promise<DataSource[]> {
    return await this.db.select().from(dataSources).where(eq(dataSources.userId, userId));
  }

  async createDataSource(insertDataSource: InsertDataSource): Promise<DataSource> {
    const result = await this.db.insert(dataSources).values(insertDataSource).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
