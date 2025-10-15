import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./message-bubble";
import { ImageUpload } from "./image-upload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import type { Message } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onSendImage: (file: File) => void;
  isLoading: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onSendImage,
  isLoading,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground max-w-md">
                Send a message, share your screen, or upload an image to begin interacting
                with the AI agent.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
              </div>
              <div className="flex items-center gap-1 bg-secondary rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-card p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <ImageUpload onImageUpload={onSendImage} />
            <div className="flex-1 relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or upload an image..."
                className="min-h-[60px] max-h-[120px] resize-none pr-12"
                disabled={isLoading}
                data-testid="input-message"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute bottom-2 right-2 h-9 w-9 rounded-full"
                disabled={!inputValue.trim() || isLoading}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
