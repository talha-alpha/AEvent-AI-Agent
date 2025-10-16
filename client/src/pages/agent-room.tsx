import { useState, useEffect } from "react";
import { VideoDisplay } from "@/components/video-display";
import { ControlBar } from "@/components/control-bar";
import { SettingsModal } from "@/components/settings-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AgentStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { RoomEvent } from "livekit-client";
import { LiveKitRoom, useRoomContext } from "@livekit/components-react";

function AgentRoomContent({ roomName }: { roomName: string }) {
  const room = useRoomContext();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [micEnabled, setMicEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState<number | undefined>();

  useEffect(() => {
    if (room) {
      setIsConnected(room.state === "connected");
      
      room.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        setAgentStatus("listening");
      });

      room.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setAgentStatus("idle");
      });

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        if (participant.identity.includes("agent")) {
          setAgentStatus("listening");
          toast({
            title: "AI Agent Connected",
            description: "The AI agent has joined the session",
          });
        }
      });

      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        // Update agent status based on audio playback
        if (room.canPlaybackAudio) {
          setAgentStatus("speaking");
        }
      });
    }
  }, [room, toast]);

  const handleMicToggle = async (enabled: boolean) => {
    try {
      await room?.localParticipant.setMicrophoneEnabled(enabled);
      setMicEnabled(enabled);
      if (enabled) {
        setAgentStatus("listening");
      } else {
        setAgentStatus("idle");
      }
    } catch (error: any) {
      toast({
        title: "Microphone error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVideoToggle = async (enabled: boolean) => {
    try {
      await room?.localParticipant.setCameraEnabled(enabled);
      setVideoEnabled(enabled);
    } catch (error: any) {
      toast({
        title: "Camera error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleScreenShareToggle = async (enabled: boolean) => {
    try {
      await room?.localParticipant.setScreenShareEnabled(enabled);
      setScreenShareEnabled(enabled);
      if (enabled) {
        toast({
          title: "Screen sharing started",
          description: "Your screen is now being shared with the AI agent",
        });
      }
    } catch (error: any) {
      toast({
        title: "Screen share error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEndSession = async () => {
    await room?.disconnect();
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
        <div>
          <h1 className="text-xl font-semibold">AI Agent Session</h1>
          <p className="text-sm text-muted-foreground">Voice-enabled Multimodal AI Assistant</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6">
          <VideoDisplay
            agentStatus={agentStatus}
            localVideoTrack={undefined}
            remoteVideoTrack={undefined}
            isConnected={isConnected}
            latency={latency}
          />
        </div>
        <ControlBar
          onMicToggle={handleMicToggle}
          onVideoToggle={handleVideoToggle}
          onScreenShareToggle={handleScreenShareToggle}
          onSettingsClick={() => setSettingsOpen(true)}
          onEndSession={handleEndSession}
          micEnabled={micEnabled}
          videoEnabled={videoEnabled}
          screenShareEnabled={screenShareEnabled}
        />
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export default function AgentRoom() {
  const { toast } = useToast();
  const [token, setToken] = useState<string>("");
  const [serverUrl, setServerUrl] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        // Create room
        const roomResponse = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "AI Agent Session" }),
        });

        if (!roomResponse.ok) {
          const errorData = await roomResponse.json();
          if (roomResponse.status === 503) {
            throw new Error(errorData.message || "LiveKit service is not configured");
          }
          throw new Error("Failed to create room");
        }

        const room = await roomResponse.json();

        // Get token
        const tokenResponse = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: room.livekitRoomName,
            participantName: "user",
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          if (tokenResponse.status === 503) {
            throw new Error(errorData.message || "LiveKit service is not configured");
          }
          throw new Error("Failed to get token");
        }

        const tokenData = await tokenResponse.json();

        setToken(tokenData.token);
        setServerUrl(tokenData.url);
        setRoomName(room.livekitRoomName);
        setIsLoading(false);
      } catch (error: any) {
        const message = error.message || "Please configure the required API keys to use the AI agent.";
        setErrorMessage(message);
        toast({
          title: "Configuration Required",
          description: message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    initializeRoom();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Initializing AI Agent...</p>
        </div>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="text-6xl">🔑</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-destructive">Configuration Required</h2>
            <p className="text-muted-foreground">
              {errorMessage || "Please configure LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables to enable AI agent functionality."}
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg text-left">
            <p className="font-semibold mb-2">Required API Keys:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>LIVEKIT_URL</li>
              <li>LIVEKIT_API_KEY</li>
              <li>LIVEKIT_API_SECRET</li>
              <li>OPENAI_API_KEY</li>
              <li>DEEPGRAM_API_KEY</li>
              <li>CARTESIA_API_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={true}
      screen={true}
    >
      <AgentRoomContent roomName={roomName} />
    </LiveKitRoom>
  );
}
