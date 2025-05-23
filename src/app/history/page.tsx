"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { chatService } from "@/services/chat";
import { Chat } from "@/types";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animation-variants";
import { Archive } from "lucide-react";
import { ChatSession } from "@/components/chat/chat-sidebar";
import { ChatArchiveDialog } from "@/components/chat/chat-archive-dialog";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const itemsPerPage = 5;

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);

      // Fetch both active and archived chats
      const activeChats = await chatService.getChatsWithMessageCounts(
        0,
        100,
        false
      );
      const archivedChats = await chatService.getChatsWithMessageCounts(
        0,
        100,
        true
      );

      // Combine all chats
      const allChats = [...activeChats, ...archivedChats];
      setChatHistory(allChats);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  // Handler for opening archive dialog
  const handleOpenArchiveDialog = () => {
    setIsArchiveDialogOpen(true);
  };

  // Handler for closing archive dialog
  const handleCloseArchiveDialog = () => {
    setIsArchiveDialogOpen(false);
  };

  // Convert Chat[] to ChatSession[] for the archive dialog
  const toChatSessions = (chats: Chat[]): ChatSession[] => {
    return chats.map((chat) => ({
      id: String(chat.id),
      title: chat.title,
      createdAt: new Date(),
      lastMessageTime: chat.lastMessageTime,
      messageCount: chat.messageCount,
      isArchived: chat.isArchived,
    }));
  };

  // Filter chats based on search term and show only unarchived chats by default
  const filteredChats = chatHistory.filter(
    (chat) =>
      !chat.isArchived &&
      chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort chats
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (sortBy === "date") {
      return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Paginate
  const totalPages = Math.ceil(sortedChats.length / itemsPerPage);
  const paginatedChats = sortedChats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <motion.div
      className="container mx-auto py-8 max-w-4xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center mb-6"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">
          Chat History
        </h1>

        <Button
          variant="outline"
          onClick={handleOpenArchiveDialog}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Archive className="w-4 h-4" />
          <span>Manage Archive</span>
        </Button>
      </motion.div>

      {/* Search and filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 mb-6"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-2">
          <Button
            variant={sortBy === "date" ? "default" : "outline"}
            onClick={() => setSortBy("date")}
            size="sm"
          >
            Sort by Date
          </Button>
          <Button
            variant={sortBy === "title" ? "default" : "outline"}
            onClick={() => setSortBy("title")}
            size="sm"
          >
            Sort by Title
          </Button>
        </div>
      </motion.div>

      {/* Chat list */}
      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          // Loading state
          <motion.div
            className="text-center p-8 bg-muted/30 rounded-lg"
            variants={fadeInUp}
          >
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="text-muted-foreground">Loading chat history...</p>
          </motion.div>
        ) : paginatedChats.length > 0 ? (
          paginatedChats.map((chat) => (
            <motion.div key={chat.id} variants={fadeInUp}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">
                      {chat.title}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {format(chat.lastMessageTime, "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {chat.messageCount} message
                      {chat.messageCount !== 1 && "s"}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/chat?id=${chat.id}`}>
                        View Conversation
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="text-center p-8 bg-muted/30 rounded-lg"
            variants={fadeInUp}
          >
            <h3 className="text-lg font-medium mb-2">No conversations found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search"
                : "Start a new chat to begin"}
            </p>
            <Button asChild>
              <Link href="/chat">Start New Chat</Link>
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="flex justify-between items-center mt-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </motion.div>
      )}

      {/* Archive Dialog */}
      <ChatArchiveDialog
        isOpen={isArchiveDialogOpen}
        onClose={handleCloseArchiveDialog}
        activeSessions={toChatSessions(
          chatHistory.filter((chat) => !chat.isArchived)
        )}
        archivedSessions={toChatSessions(
          chatHistory.filter((chat) => chat.isArchived)
        )}
        onSessionsUpdate={fetchChatHistory}
      />
    </motion.div>
  );
}
