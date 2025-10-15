import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Video, Mic, Image as ImageIcon, MonitorUp, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Video,
      title: "Video Communication",
      description: "Connect with the AI agent via live video for face-to-face interaction",
    },
    {
      icon: Mic,
      title: "Voice Interaction",
      description: "Speak naturally with advanced speech-to-text and text-to-speech",
    },
    {
      icon: ImageIcon,
      title: "Image Analysis",
      description: "Share screenshots and images for visual context and analysis",
    },
    {
      icon: MonitorUp,
      title: "Screen Sharing",
      description: "Share your screen for collaborative problem-solving",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">AI Agent</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 tracking-tight">
              Multimodal AI Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Communicate with an advanced AI agent through voice, video, images, and screen
              sharing. Get help with any task using natural multimodal interaction.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/agent")}
              data-testid="button-start-session"
            >
              <Video className="h-5 w-5 mr-2" />
              Start New Session
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {features.map((feature) => (
              <Card key={feature.title} className="hover-elevate">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3">
                    Powered by Advanced AI
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI agent uses state-of-the-art models for speech recognition (Deepgram),
                    language understanding (OpenAI GPT-5), and natural voice synthesis (Cartesia)
                    to provide seamless multimodal interaction.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Real-time speech-to-text with Deepgram
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Advanced reasoning with OpenAI GPT-5
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Natural voice output with Cartesia TTS
                    </li>
                  </ul>
                </div>
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Sparkles className="h-24 w-24 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t mt-24">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-sm text-muted-foreground">
            AI Agent Platform - Multimodal AI Assistant
          </p>
        </div>
      </footer>
    </div>
  );
}
