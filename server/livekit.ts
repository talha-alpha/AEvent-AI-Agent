import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { env } from "./env";

export const roomClient = new RoomServiceClient(
  env.LIVEKIT_URL,
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET
);

export async function createAccessToken(roomName: string, participantName: string): Promise<string> {
  const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity: participantName,
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await at.toJwt();
}

export async function createLiveKitRoom(roomName: string): Promise<void> {
  try {
    await roomClient.createRoom({
      name: roomName,
      emptyTimeout: 300, // 5 minutes
      maxParticipants: 10,
    });
  } catch (error: any) {
    // Room might already exist, which is fine
    if (!error.message?.includes("already exists")) {
      throw error;
    }
  }
}

export async function deleteLiveKitRoom(roomName: string): Promise<void> {
  try {
    await roomClient.deleteRoom(roomName);
  } catch (error) {
    console.error(`Failed to delete LiveKit room: ${roomName}`, error);
  }
}
