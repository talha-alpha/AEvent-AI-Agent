import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, Volume2, Sparkles } from "lucide-react";
import type { AgentStatus } from "@shared/schema";

interface AgentStatusIndicatorProps {
  status: AgentStatus;
}

export function AgentStatusIndicator({ status }: AgentStatusIndicatorProps) {
  const statusConfig = {
    initializing: {
      icon: Loader2,
      label: "Initializing...",
      className: "bg-muted text-muted-foreground",
      iconClassName: "animate-spin",
    },
    listening: {
      icon: Mic,
      label: "Agent Listening",
      className: "bg-chart-3 text-white",
      iconClassName: "animate-pulse",
    },
    thinking: {
      icon: Sparkles,
      label: "Agent Thinking",
      className: "bg-primary text-primary-foreground",
      iconClassName: "animate-pulse",
    },
    speaking: {
      icon: Volume2,
      label: "Agent Speaking",
      className: "bg-primary text-primary-foreground",
      iconClassName: "animate-pulse",
    },
    idle: {
      icon: Sparkles,
      label: "Ready",
      className: "bg-secondary text-secondary-foreground",
      iconClassName: "",
    },
  };

  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  return (
    <Badge
      className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-opacity-90 ${config.className}`}
      data-testid={`status-agent-${status}`}
    >
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <span className="text-sm font-medium">{config.label}</span>
    </Badge>
  );
}
