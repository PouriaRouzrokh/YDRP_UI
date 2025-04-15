"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelLeftOpen } from "lucide-react";
import { ChatSidebar, ChatSession } from "@/components/chat/chat-sidebar";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatFooterSpacer } from "@/components/chat/chat-footer-spacer";
import {
  ChatMessage,
  Message,
  TypingIndicator,
} from "@/components/chat/message";

// Mock data for demonstration purposes
const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: "1",
    title: "Radiation Safety Policies",
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    messageCount: 8,
  },
  {
    id: "2",
    title: "Patient Privacy Guidelines",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    messageCount: 5,
  },
  {
    id: "3",
    title: "Equipment Maintenance",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    messageCount: 12,
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    content:
      "Hello, I'd like to know about radiation safety policies for pregnant staff.",
    role: "user",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "2",
    content:
      "According to Yale Radiology policies, pregnant staff should follow these guidelines:\n\n1. Report pregnancy to Radiation Safety Officer\n2. Wear dosimeter at waist level under lead apron\n3. Limit fluoroscopy procedures when possible\n4. Maintain distance from radiation sources when not directly involved",
    role: "assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 29), // 29 minutes ago
    references: [
      {
        id: "ref1",
        title: "Radiation Safety for Pregnant Personnel",
        excerpt:
          "Section 3.4: Pregnant staff members are entitled to additional protective measures while maintaining their regular job duties with appropriate accommodations.",
        url: "#radiation-safety-policy",
      },
    ],
  },
  {
    id: "3",
    content: "What is the dose limit for pregnant staff?",
    role: "user",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
];

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] =
    useState<ChatSession[]>(MOCK_CHAT_SESSIONS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeSessionId, setActiveSessionId] = useState<string>("1");

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    // Add user message
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Simulate typing indicator
    setIsTyping(true);

    // Simulate assistant response after delay
    setTimeout(() => {
      setIsTyping(false);

      const newAssistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content:
          "This is a simulated response for the chat interface layout. In the actual implementation, this would be a proper response from the backend API.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
    }, 2000);
  };

  const handleNewChat = () => {
    // Create a new chat session
    const newChatId = `new-${Date.now()}`;

    // Create new chat session
    const newSession: ChatSession = {
      id: newChatId,
      title: "New Conversation",
      createdAt: new Date(),
      lastMessageTime: new Date(),
      messageCount: 0,
    };

    // Update sessions and set active id
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newChatId);

    // Clear messages
    setMessages([]);
  };

  const handleSelectChat = (chatId: string) => {
    // Update active chat
    setActiveSessionId(chatId);

    // In a real app, we would load this chat's messages
    // For now, we'll just use our mock messages if the first chat is selected
    if (chatId === "1") {
      setMessages(MOCK_MESSAGES);
    } else {
      setMessages([]);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* Sidebar - only visible on medium screens and up */}
      <div className="hidden md:block h-full">
        <ChatSidebar
          sessions={chatSessions}
          activeSessionId={activeSessionId}
          onSessionSelect={handleSelectChat}
          onNewChat={handleNewChat}
          isCollapsed={!isSidebarOpen}
        />
      </div>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 h-full px-4">
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex mr-2"
            >
              <PanelLeftOpen className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <h2 className="text-lg font-medium">
              {chatSessions.find((chat) => chat.id === activeSessionId)
                ?.title || "New Conversation"}
            </h2>
          </div>

          {/* Mobile-only New Chat button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="md:hidden"
          >
            New Chat
          </Button>
        </div>

        {/* Fixed height container for messages and input */}
        <div className="flex flex-col h-[calc(100%-4rem)]">
          {/* Messages area with flex-1 to fill available space */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="flex flex-col pb-2">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Welcome to Yale Department of Radiology Policy Chatbot
                      </h3>
                      <p className="max-w-md">
                        Ask questions about department policies, safety
                        protocols, or procedural guidelines.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))
                )}

                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input area with fixed height - Adjusted for better mobile display */}
          <div className="pb-2 pt-2">
            <ChatInput
              onSubmit={handleSendMessage}
              isDisabled={isTyping}
              placeholder="Type your message..."
              className="pb-0"
            />
          </div>

          {/* Spacer to prevent overlap with fixed footer */}
          <ChatFooterSpacer />
        </div>
      </div>
    </div>
  );
}
