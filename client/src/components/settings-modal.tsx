import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Mic, Video, Database } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-settings">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your audio, video, and agent settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="audio" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audio" className="gap-2">
              <Mic className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Data Sources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="noise-cancellation">Noise Cancellation</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce background noise during calls
                </p>
              </div>
              <Switch id="noise-cancellation" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="echo-cancellation">Echo Cancellation</Label>
                <p className="text-sm text-muted-foreground">
                  Prevent audio feedback
                </p>
              </div>
              <Switch id="echo-cancellation" defaultChecked />
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-video">Auto-enable Video</Label>
                <p className="text-sm text-muted-foreground">
                  Start with video enabled by default
                </p>
              </div>
              <Switch id="auto-video" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mirror-video">Mirror Video</Label>
                <p className="text-sm text-muted-foreground">
                  Show mirrored version of your camera
                </p>
              </div>
              <Switch id="mirror-video" defaultChecked />
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 py-4">
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Data source integration will be available soon.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Connect your platform APIs and backend services to provide context to the AI agent.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
