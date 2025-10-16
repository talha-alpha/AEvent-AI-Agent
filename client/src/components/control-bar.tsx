import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Settings,
  PhoneOff,
} from "lucide-react";
import { useState } from "react";

interface ControlBarProps {
  onMicToggle: (enabled: boolean) => void;
  onVideoToggle: (enabled: boolean) => void;
  onScreenShareToggle: (enabled: boolean) => void;
  onSettingsClick: () => void;
  onEndSession: () => void;
  micEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
}

export function ControlBar({
  onMicToggle,
  onVideoToggle,
  onScreenShareToggle,
  onSettingsClick,
  onEndSession,
  micEnabled,
  videoEnabled,
  screenShareEnabled,
}: ControlBarProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-card border-t">
      <Button
        size="icon"
        variant={micEnabled ? "default" : "secondary"}
        className={`h-12 w-12 rounded-full ${
          micEnabled ? "bg-chart-3 hover:bg-chart-3/90" : ""
        }`}
        onClick={() => onMicToggle(!micEnabled)}
        data-testid="button-toggle-mic"
      >
        {micEnabled ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>

      <Button
        size="icon"
        variant={videoEnabled ? "default" : "secondary"}
        className={`h-12 w-12 rounded-full ${
          videoEnabled ? "bg-chart-3 hover:bg-chart-3/90" : ""
        }`}
        onClick={() => onVideoToggle(!videoEnabled)}
        data-testid="button-toggle-video"
      >
        {videoEnabled ? (
          <Video className="h-5 w-5" />
        ) : (
          <VideoOff className="h-5 w-5" />
        )}
      </Button>

      <Button
        size="icon"
        variant={screenShareEnabled ? "default" : "secondary"}
        className={`h-12 w-12 rounded-full ${
          screenShareEnabled ? "bg-primary hover:bg-primary/90" : ""
        }`}
        onClick={() => onScreenShareToggle(!screenShareEnabled)}
        data-testid="button-toggle-screenshare"
      >
        <MonitorUp className="h-5 w-5" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        className="h-12 w-12 rounded-full"
        onClick={onSettingsClick}
        data-testid="button-settings"
      >
        <Settings className="h-5 w-5" />
      </Button>

      <Button
        variant="destructive"
        className="h-12 px-6 rounded-full"
        onClick={onEndSession}
        data-testid="button-end-session"
      >
        <PhoneOff className="h-5 w-5 mr-2" />
        End Session
      </Button>
    </div>
  );
}
