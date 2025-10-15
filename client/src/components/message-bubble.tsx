import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Message } from "@shared/schema";
import { User, Bot, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const isAgent = message.sender === "agent";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`message-${message.id}`}
    >
      <Avatar className="h-10 w-10">
        {isAgent ? (
          <>
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-card text-card-foreground"
              : "bg-secondary text-secondary-foreground border border-primary/10"
          }`}
        >
          {message.type === "image" && message.metadata && (
            <div className="mb-2">
              <img
                src={message.metadata.imageUrl as string}
                alt="Uploaded"
                className="rounded-lg max-w-xs"
              />
            </div>
          )}
          {message.type === "text" && (
            <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
          {message.type === "audio" && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <ImageIcon className="h-3 w-3" />
                Audio message
              </Badge>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {format(new Date(message.createdAt), "h:mm a")}
        </span>
      </div>
    </div>
  );
}
