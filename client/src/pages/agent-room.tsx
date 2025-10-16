import { useState, useEffect } from "react";
import { VideoDisplay } from "@/components/video-display";
import { ControlBar } from "@/components/control-bar";
import { SettingsModal } from "@/components/settings-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AgentStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Room, RoomEvent, Track } from "livekit-client";
import { LiveKitRoom, useRoomContext, useTracks } from "@livekit/components-react";

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

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: true },
    ],
    { onlySubscribed: false }
  );

  const localVideoTrack = tracks.find(
    (track) => track.participant.isLocal && track.source === Track.Source.Camera
  )?.publication?.track;

  const localScreenTrack = tracks.find(
    (track) => track.participant.isLocal && track.source === Track.Source.ScreenShare
  )?.publication?.track;

  const remoteVideoTrack = tracks.find(
    (track) => !track.participant.isLocal && track.source === Track.Source.Camera
  )?.publication?.track;

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
            localVideoTrack={localVideoTrack || localScreenTrack}
            remoteVideoTrack={remoteVideoTrack}
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
          throw new Error("Failed to get token");
        }

        const tokenData = await tokenResponse.json();

        setToken(tokenData.token);
        setServerUrl(tokenData.url);
        setRoomName(room.livekitRoomName);
        setIsLoading(false);
      } catch (error: any) {
        toast({
          title: "Failed to initialize room",
          description: error.message,
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
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">Failed to initialize session</p>
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
      video={false}
    >
      <AgentRoomContent roomName={roomName} />
    </LiveKitRoom>
  );
}
