import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
} from "../services/chat.service";
import { searchUsers } from "../services/user.service";
import { getUserInfo } from "../services/localStorageService";
import { useSocket } from "../contexts/SocketContext";
import { scrollToBottom as scrollHelper } from "../utils/chatHelpers";

export const useChatOperations = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Chat state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Property context
  const [propertyContext, setPropertyContext] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const currentConversationRef = useRef(null);

  // Socket context
  const { isConnected, registerMessageCallbacks, sendMessage } = useSocket();

  // Get current user
  const currentUser = getUserInfo();

  // Update current conversation ref
  useEffect(() => {
    const convId =
      selectedConversation?.conversationId || selectedConversation?.id;
    currentConversationRef.current = convId;
    console.log("📌 Current conversation ref updated:", convId);
  }, [selectedConversation]);

  // Handle navigation from property detail
  useEffect(() => {
    if (location.state) {
      const { conversationId, propertyId, propertyTitle, ownerId, ownerName } =
        location.state;

      if (propertyId) {
        setPropertyContext({
          propertyId,
          propertyTitle,
          ownerId,
          ownerName,
        });
      }

      if (conversationId) {
        sessionStorage.setItem("pendingConversationId", conversationId);
      }
    }
  }, [location.state]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await getMyConversations();
      const convList =
        response?.result || response?.data?.result || response?.data || [];

      console.log("✅ Loaded conversations:", convList);
      setConversations(convList);

      // Auto-select pending conversation
      const pendingId = sessionStorage.getItem("pendingConversationId");
      if (pendingId) {
        const targetConv = convList.find(
          (c) => c.conversationId === pendingId || c.id === pendingId
        );
        if (targetConv) {
          handleSelectConversation(targetConv);
        }
        sessionStorage.removeItem("pendingConversationId");
      }
    } catch (error) {
      console.error("❌ Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages
  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await getMessages(conversationId);
      const msgList =
        response?.result || response?.data?.result || response?.data || [];

      console.log("📨 Loaded messages:", msgList.length);
      setMessages(msgList);
      scrollHelper(messagesEndRef);
    } catch (error) {
      console.error("❌ Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Select conversation
  const handleSelectConversation = useCallback((conversation) => {
    const convId = conversation.conversationId || conversation.id;

    setSelectedConversation(conversation);
    currentConversationRef.current = convId;
    loadMessages(convId);

    // Join socket room
    if (sendMessage) {
      sendMessage("join_conversation", { conversationId: convId });
      console.log("🔔 Joined socket room for conversation:", convId);
    }
  }, [sendMessage]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    if (!currentUser) {
      alert("Vui lòng đăng nhập để gửi tin nhắn");
      return;
    }

    const convId =
      selectedConversation.conversationId || selectedConversation.id;

    // Create optimistic message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversationId: convId,
      message: newMessage.trim(),
      me: true,
      sender: {
        userId: currentUser.userId,
        username: currentUser.username,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatar: currentUser.avatar,
      },
      createdDate: new Date().toISOString(),
      isPending: true,
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    scrollHelper(messagesEndRef);

    try {
      setSending(true);

      const payload = {
        conversationId: convId,
        message: tempMessage.message,
      };

      console.log("📤 Sending message:", payload);
      const response = await createMessage(payload);
      const sentMessage =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      console.log("✅ Message sent successfully:", sentMessage);

      // Replace temp message with real message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...sentMessage, isPending: false } : msg
        )
      );

      // Send property context if first message
      if (
        propertyContext &&
        messages.length === 0 &&
        !sessionStorage.getItem(`property-context-sent-${convId}`)
      ) {
        setTimeout(async () => {
          const contextMessage = {
            conversationId: convId,
            message: `Xin chào! Tôi quan tâm đến bất động sản: "${propertyContext.propertyTitle}"`,
          };

          try {
            await createMessage(contextMessage);
            sessionStorage.setItem(`property-context-sent-${convId}`, "true");
          } catch (err) {
            console.error("Error sending context message:", err);
          }
        }, 500);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // Handle message received (socket)
  const handleMessageReceived = useCallback((data) => {
    console.log("📩 WebSocket message received:", data);

    const msgConvId = data.conversationId;
    const currentConvId = currentConversationRef.current;

    if (!currentConvId || msgConvId !== currentConvId) {
      console.log("ℹ️ Message for different conversation");
      return;
    }

    setMessages((prev) => {
      const msgId = data.id || data.messageId;

      // Block duplicates
      if (prev.some((msg) => msg.id === msgId)) {
        console.log("⚠️ Duplicate message blocked");
        return prev;
      }

      // Replace temp message
      const tempIndex = prev.findIndex(
        (m) => m.isPending && m.message === data.message
      );

      if (tempIndex !== -1) {
        const updated = [...prev];
        updated[tempIndex] = { ...data, isPending: false };
        return updated;
      }

      // Append normally
      return [...prev, data];
    });

    setConversations((prev) => {
      const convId = data.conversationId;
      const exists = prev.some((c) => (c.conversationId || c.id) === convId);

      // If conversation doesn't exist, reload
      if (!exists) {
        loadConversations();
        return prev;
      }

      // Update last message
      return prev.map((conv) => {
        if ((conv.conversationId || conv.id) === convId) {
          return {
            ...conv,
            lastMessage: data,
            lastMessageTime:
              data.createdDate || data.createdAt || new Date().toISOString(),
          };
        }
        return conv;
      });
    });

    scrollHelper(messagesEndRef);
  }, []);

  // Handle message sent (socket)
  const handleMessageSent = useCallback((data) => {
    console.log("📤 Message sent event:", data);

    const msgConvId = data.conversationId;
    const currentConvId = currentConversationRef.current;

    if (currentConvId && msgConvId === currentConvId) {
      setMessages((prev) => {
        // Replace temp message with real one
        const tempIdx = prev.findIndex(
          (m) => m.isPending && m.message === data.message
        );

        if (tempIdx === -1) {
          return prev;
        }

        const updated = [...prev];
        updated[tempIdx] = {
          ...data,
          isPending: false,
        };

        return updated;
      });
    }
  }, []);

  // Register socket callbacks
  useEffect(() => {
    if (!registerMessageCallbacks) {
      console.warn("⚠️ Socket context not available");
      return;
    }

    console.log("🔌 Registering socket callbacks");

    registerMessageCallbacks({
      onMessageReceived: handleMessageReceived,
      onMessageSent: handleMessageSent,
    });
  }, [registerMessageCallbacks, handleMessageReceived, handleMessageSent]);

  // Search users
  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      const response = await searchUsers({ keyword: searchTerm });
      const results =
        response?.result || response?.data?.result || response?.data || [];
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  // Create conversation
  const handleCreateConversation = async (userId) => {
    try {
      const payload = {
        type: "DIRECT",
        participantIds: [userId],
      };

      const response = await createConversation(payload);
      const newConv =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setShowSearchModal(false);
      setSearchTerm("");
      setSearchResults([]);

      const convId = newConv.conversationId || newConv.id;
      loadMessages(convId);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
    }
  };

  // Remove property context
  const handleRemovePropertyContext = () => {
    setPropertyContext(null);
    navigate("/messages", { replace: true });
  };

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    newMessage,
    loading,
    sending,
    searchTerm,
    searchResults,
    searching,
    showSearchModal,
    propertyContext,
    isConnected,
    currentUser,
    messagesEndRef,

    // Setters
    setNewMessage,
    setSearchTerm,
    setShowSearchModal,

    // Handlers
    handleSelectConversation,
    handleSendMessage,
    handleSearchUsers,
    handleCreateConversation,
    handleRemovePropertyContext,
  };
};