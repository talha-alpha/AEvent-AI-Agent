import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface ConnectionQualityProps {
  latency?: number;
  isConnected: boolean;
}

export function ConnectionQuality({ latency, isConnected }: ConnectionQualityProps) {
  if (!isConnected) {
    return (
      <Badge
        variant="destructive"
        className="flex items-center gap-2 backdrop-blur-md bg-opacity-90"
        data-testid="status-connection-disconnected"
      >
        <WifiOff className="h-3 w-3" />
        <span className="text-xs">Disconnected</span>
      </Badge>
    );
  }

  const getQualityStatus = () => {
    if (!latency) return { color: "bg-muted text-muted-foreground", label: "Connecting..." };
    if (latency < 100) return { color: "bg-chart-3 text-white", label: `${latency}ms` };
    if (latency < 300) return { color: "bg-chart-2 text-white", label: `${latency}ms` };
    return { color: "bg-chart-4 text-white", label: `${latency}ms` };
  };

  const quality = getQualityStatus();

  return (
    <Badge
      className={`flex items-center gap-2 backdrop-blur-md bg-opacity-90 ${quality.color}`}
      data-testid="status-connection-quality"
    >
      <Wifi className="h-3 w-3" />
      <span className="text-xs">{quality.label}</span>
    </Badge>
  );
}
