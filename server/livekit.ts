import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const livekitUrl = process.env.LIVEKIT_URL || "";
const apiKey = process.env.LIVEKIT_API_KEY || "";
const apiSecret = process.env.LIVEKIT_API_SECRET || "";

// Only initialize if credentials are available
export const roomClient = livekitUrl && apiKey && apiSecret 
  ? new RoomServiceClient(livekitUrl, apiKey, apiSecret)
  : null;

export async function createAccessToken(roomName: string, participantName: string): Promise<string> {
  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit credentials not configured. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables.");
  }
  
  const at = new AccessToken(apiKey, apiSecret, {
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
  if (!roomClient) {
    throw new Error("LiveKit is not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables.");
  }
  
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
  if (!roomClient) {
    console.warn("LiveKit is not configured, skipping room deletion");
    return;
  }
  
  try {
    await roomClient.deleteRoom(roomName);
  } catch (error) {
    console.error(`Failed to delete LiveKit room: ${roomName}`, error);
  }
}
