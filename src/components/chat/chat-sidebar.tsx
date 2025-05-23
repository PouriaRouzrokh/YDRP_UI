import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PlusCircle, Archive } from "lucide-react";
import { ChatContextMenu } from "./chat-context-menu";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  lastMessageTime?: Date;
  messageCount?: number;
  isArchived?: boolean;
}

export interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onOpenRenameDialog: (chatId: string) => void;
  onOpenArchiveDialog: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
  isCollapsed,
  onOpenRenameDialog,
  onOpenArchiveDialog,
}: ChatSidebarProps) {
  if (isCollapsed) {
    return (
      <div className="flex h-full w-[60px] flex-col items-center border-r p-2">
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={onNewChat}
          aria-label="New Chat"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-[260px] flex-col border-r overflow-hidden">
        <div className="p-4 flex-shrink-0 flex items-center gap-2">
          <Button onClick={onNewChat} className="flex-1 justify-start gap-2">
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Archive button clicked");
              onOpenArchiveDialog();
            }}
            aria-label="Manage Archive"
            title="Manage Archive"
            className="min-w-9 h-9"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full px-2">
            <div className="space-y-1 pb-4">
              {sessions?.map((session) => (
                <ChatContextMenu
                  key={session.id}
                  chat={session}
                  onOpenRenameDialog={onOpenRenameDialog}
                >
                  <Button
                    variant={
                      activeSessionId === session.id ? "secondary" : "ghost"
                    }
                    className={cn(
                      "w-full justify-start truncate overflow-hidden text-sm group",
                      activeSessionId === session.id ? "bg-secondary/50" : ""
                    )}
                    onClick={() => onSessionSelect(session.id)}
                  >
                    {session.title}
                  </Button>
                </ChatContextMenu>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
