import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import aiService from "../../../../services/aiService";
import { getPromptsByPath } from "../utils/assistantPrompts";

const useAssistantChat = ({ pathname }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showConversations, setShowConversations] = useState(false);

  const messagesEndRef = useRef(null);
  const dragRef = useRef(null);

  const quickPrompts = getPromptsByPath(pathname);

  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await aiService.getConversations();
      setConversations(response.content || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await aiService.getMessages(conversationId);
      setMessages(response || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const content = input.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", content, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await aiService.chat(content, currentConversationId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.content,
          createdAt: response.timestamp || new Date().toISOString(),
        },
      ]);

      if (!currentConversationId && response.conversationId) {
        setCurrentConversationId(response.conversationId);
        loadConversations();
      }
    } catch (error) {
      let errorMessage = "Xin loi, da co loi xay ra. Vui long thu lai.";
      if (error.response?.status === 401) {
        errorMessage = "Ban can dang nhap de su dung tro ly AI.";
      } else if (error.response?.status === 429) {
        errorMessage = "Ban da gui qua nhieu tin nhan. Vui long doi mot chut.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          createdAt: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();
    try {
      await aiService.deleteConversation(conversationId);
      loadConversations();
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleUseQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setShowConversations(false);
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    setShowConversations(false);
  };

  const handleInputKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateTime) =>
    formatDistanceToNow(new Date(dateTime), {
      addSuffix: true,
      locale: vi,
    });

  return {
    open,
    setOpen,
    messages,
    input,
    setInput,
    loading,
    conversations,
    showConversations,
    setShowConversations,
    currentConversationId,
    quickPrompts,
    messagesEndRef,
    dragRef,
    handleSend,
    handleDeleteConversation,
    handleUseQuickPrompt,
    handleNewConversation,
    handleSelectConversation,
    handleInputKeyPress,
    formatMessageTime,
  };
};

export default useAssistantChat;
