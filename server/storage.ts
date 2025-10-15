import { 
  type User, 
  type InsertUser,
  type Room,
  type InsertRoom,
  type Message,
  type InsertMessage,
  type AgentSession,
  type InsertAgentSession,
  type DataSource,
  type InsertDataSource,
  users,
  rooms,
  messages,
  agentSessions,
  dataSources
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { env } from "./env";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Room methods
  getRoom(id: string): Promise<Room | undefined>;
  getRoomByLivekitName(livekitRoomName: string): Promise<Room | undefined>;
  getUserRooms(userId: string): Promise<Room[]>;
  createRoom(data: InsertRoom & { livekitRoomName: string }): Promise<Room>;
  updateRoomStatus(id: string, status: string): Promise<void>;
  
  // Message methods
  getMessage(id: string): Promise<Message | undefined>;
  getRoomMessages(roomId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Agent Session methods
  getAgentSession(roomId: string): Promise<AgentSession | undefined>;
  createAgentSession(session: InsertAgentSession): Promise<AgentSession>;
  updateAgentStatus(roomId: string, status: string): Promise<void>;
  
  // Data Source methods
  getDataSource(id: string): Promise<DataSource | undefined>;
  getUserDataSources(userId: string): Promise<DataSource[]>;
  createDataSource(dataSource: InsertDataSource): Promise<DataSource>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rooms: Map<string, Room>;
  private messages: Map<string, Message>;
  private agentSessions: Map<string, AgentSession>;
  private dataSources: Map<string, DataSource>;

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.messages = new Map();
    this.agentSessions = new Map();
    this.dataSources = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomByLivekitName(livekitRoomName: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(
      (room) => room.livekitRoomName === livekitRoomName,
    );
  }

  async getUserRooms(userId: string): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(
      (room) => room.userId === userId,
    );
  }

  async createRoom(insertRoom: InsertRoom & { livekitRoomName: string }): Promise<Room> {
    const id = randomUUID();
    const room: Room = { 
      ...insertRoom, 
      id,
      status: insertRoom.status || "active",
      createdAt: new Date(),
      endedAt: null
    };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoomStatus(id: string, status: string): Promise<void> {
    const room = this.rooms.get(id);
    if (room) {
      room.status = status;
      if (status === "ended") {
        room.endedAt = new Date();
      }
    }
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.roomId === roomId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id,
      type: insertMessage.type || "text",
      metadata: insertMessage.metadata || null,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getAgentSession(roomId: string): Promise<AgentSession | undefined> {
    return Array.from(this.agentSessions.values()).find(
      (session) => session.roomId === roomId,
    );
  }

  async createAgentSession(insertSession: InsertAgentSession): Promise<AgentSession> {
    const id = randomUUID();
    const session: AgentSession = { 
      ...insertSession, 
      id,
      status: insertSession.status || "initializing",
      metadata: insertSession.metadata || null,
      lastActivity: new Date()
    };
    this.agentSessions.set(id, session);
    return session;
  }

  async updateAgentStatus(roomId: string, status: string): Promise<void> {
    const session = Array.from(this.agentSessions.values()).find(
      (s) => s.roomId === roomId,
    );
    if (session) {
      session.status = status;
      session.lastActivity = new Date();
    }
  }

  async getDataSource(id: string): Promise<DataSource | undefined> {
    return this.dataSources.get(id);
  }

  async getUserDataSources(userId: string): Promise<DataSource[]> {
    return Array.from(this.dataSources.values()).filter(
      (dataSource) => dataSource.userId === userId,
    );
  }

  async createDataSource(insertDataSource: InsertDataSource): Promise<DataSource> {
    const id = randomUUID();
    const dataSource: DataSource = { 
      ...insertDataSource, 
      id,
      isActive: insertDataSource.isActive ?? true,
      createdAt: new Date()
    };
    this.dataSources.set(id, dataSource);
    return dataSource;
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
