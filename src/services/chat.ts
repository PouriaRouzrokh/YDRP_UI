import { Chat, ChatMessage, ChatSummary, MessageSummary } from "@/types";
import { authService } from "./auth";
import { siteConfig } from "@/config/site";

/**
 * Chat service for interacting with the backend chat API
 */
export const chatService = {
  /**
   * Get chat history for the current user
   */
  async getChats(skip = 0, limit = 100): Promise<ChatSummary[]> {
    // Check if admin mode is enabled
    const isAdminMode = siteConfig.settings.adminMode;

    // Skip authentication check if admin mode is enabled
    if (!isAdminMode && !authService.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const token = authService.getToken();
    const url = `${siteConfig.api.baseUrl}${siteConfig.api.endpoints.chat}?skip=${skip}&limit=${limit}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }

      return (await response.json()) as ChatSummary[];
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  },

  /**
   * Get messages for a specific chat
   */
  async getChatMessages(
    chatId: number,
    skip = 0,
    limit = 100
  ): Promise<MessageSummary[]> {
    // Check if admin mode is enabled
    const isAdminMode = siteConfig.settings.adminMode;

    // Skip authentication check if admin mode is enabled
    if (!isAdminMode && !authService.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const token = authService.getToken();
    const url = `${siteConfig.api.baseUrl}${siteConfig.api.endpoints.chat}/${chatId}/messages?skip=${skip}&limit=${limit}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages for chat ${chatId}`);
      }

      return (await response.json()) as MessageSummary[];
    } catch (error) {
      console.error(`Error fetching messages for chat ${chatId}:`, error);
      throw error;
    }
  },

  /**
   * Convert API chat summaries to UI chat format
   */
  formatChatsForUI(chats: ChatSummary[]): Chat[] {
    return chats.map((chat) => ({
      id: chat.id,
      title: chat.title ?? "Untitled Chat",
      lastMessageTime: new Date(chat.updated_at),
      // We don't have message count in the API response, so we'll show empty
      messageCount: 0,
    }));
  },

  /**
   * Convert API messages to UI message format
   */
  formatMessagesForUI(messages: MessageSummary[]): ChatMessage[] {
    return messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: new Date(message.created_at),
    }));
  },
};
