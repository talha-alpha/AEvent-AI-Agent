import { useState, useEffect } from "react";
import { VideoDisplay } from "@/components/video-display";
import { ChatInterface } from "@/components/chat-interface";
import { ControlBar } from "@/components/control-bar";
import { SettingsModal } from "@/components/settings-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Message, AgentStatus } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Room, RoomEvent, Track } from "livekit-client";
import { LiveKitRoom, useRoomContext, useTracks } from "@livekit/components-react";

function AgentRoomContent({ roomName, roomId }: { roomName: string; roomId: string }) {
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
        }
      });
    }
  }, [room]);

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", roomId],
    queryFn: async () => {
      const response = await fetch(`/api/messages?roomId=${roomId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    },
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        roomId,
        content,
        sender: "user",
        type: "text",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setAgentStatus("thinking");
      setTimeout(() => setAgentStatus("speaking"), 1000);
      setTimeout(() => setAgentStatus("listening"), 3000);
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("roomId", roomId);
      
      const response = await fetch("/api/messages/image", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setAgentStatus("thinking");
      setTimeout(() => setAgentStatus("speaking"), 1000);
      setTimeout(() => setAgentStatus("listening"), 3000);
    },
    onError: (error) => {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
          <p className="text-sm text-muted-foreground">Multimodal AI Assistant</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 lg:w-3/5 flex flex-col">
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

        <div className="w-full lg:w-2/5 border-l">
          <ChatInterface
            messages={messages}
            onSendMessage={(content) => sendMessageMutation.mutate(content)}
            onSendImage={(file) => sendImageMutation.mutate(file)}
            isLoading={sendMessageMutation.isPending || sendImageMutation.isPending}
          />
        </div>
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
  const [roomId, setRoomId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create a room and get token
    const initializeRoom = async () => {
      try {
        // Create room
        const roomRes = await apiRequest("POST", "/api/rooms", {
          name: "AI Agent Session",
          userId: "demo-user",
          status: "active",
        });
        const roomResponse = await roomRes.json();

        // Get token
        const tokenRes = await apiRequest("POST", `/api/rooms/${roomResponse.id}/token`, {
          participantName: "user",
        });
        const tokenResponse = await tokenRes.json();

        setRoomId(roomResponse.id);
        setToken(tokenResponse.token);
        setServerUrl(tokenResponse.url);
        setRoomName(tokenResponse.roomName);
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
      audio={false}
      video={false}
    >
      <AgentRoomContent roomName={roomName} roomId={roomId} />
    </LiveKitRoom>
  );
}
