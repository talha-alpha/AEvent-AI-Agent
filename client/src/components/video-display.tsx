import { AgentStatusIndicator } from "./agent-status-indicator";
import { ConnectionQuality } from "./connection-quality";
import type { AgentStatus } from "@shared/schema";
import { useEffect, useRef } from "react";

interface VideoDisplayProps {
  agentStatus: AgentStatus;
  localVideoTrack?: MediaStreamTrack;
  remoteVideoTrack?: MediaStreamTrack;
  isConnected: boolean;
  latency?: number;
}

export function VideoDisplay({
  agentStatus,
  localVideoTrack,
  remoteVideoTrack,
  isConnected,
  latency,
}: VideoDisplayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      const stream = new MediaStream([localVideoTrack]);
      localVideoRef.current.srcObject = stream;
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteVideoTrack) {
      const stream = new MediaStream([remoteVideoTrack]);
      remoteVideoRef.current.srcObject = stream;
    }
  }, [remoteVideoTrack]);

  return (
    <div className="relative w-full h-full bg-card rounded-lg overflow-hidden">
      {remoteVideoTrack ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          data-testid="video-remote"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground">AI</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">AI Agent Ready</p>
          </div>
        </div>
      )}

      {localVideoTrack && (
        <div className="absolute bottom-4 right-4 w-48 aspect-video rounded-lg overflow-hidden border-2 border-border shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            data-testid="video-local"
          />
        </div>
      )}

      <div className="absolute top-4 right-4">
        <AgentStatusIndicator status={agentStatus} />
      </div>

      <div className="absolute top-4 left-4">
        <ConnectionQuality latency={latency} isConnected={isConnected} />
      </div>
    </div>
  );
}
