// web-app/src/hooks/useChatOperations.js
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
} from "../../services/chatService";
import { searchUsers } from "../../services/userService";
import { getUserInfo } from "../../services/localStorageService";
import { useSocket } from "../../contexts/SocketContext";
import { scrollToBottom as scrollHelper } from "../../utils/chatHelpers";
import { useDialog } from "../../contexts/DialogContext";

export const useChatOperations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useDialog();

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

  //  Load conversations function (useCallback for stable reference)
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyConversations();
      const convList =
        response?.result || response?.data?.result || response?.data || [];

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
  }, []); // No dependencies - stable function

  //  Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  //  Refresh conversations function (public API)
  const refreshConversations = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  // Load messages
  const loadMessages = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      const response = await getMessages(conversationId);
      const msgList =
        response?.result || response?.data?.result || response?.data || [];

      setMessages(msgList);
      scrollHelper(messagesEndRef);
    } catch (error) {
      console.error("❌ Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback(
    (conversation) => {
      const convId = conversation.conversationId || conversation.id;

      setSelectedConversation(conversation);
      currentConversationRef.current = convId;
      loadMessages(convId);

      // Join socket room
      if (sendMessage) {
        sendMessage("join_conversation", { conversationId: convId });
      }
    },
    [sendMessage, loadMessages]
  );

  // Send message
  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !selectedConversation) return;

      if (!currentUser) {
        showToast("Vui lòng đăng nhập để gửi tin nhắn", "warning");
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

        const response = await createMessage(payload);
        const sentMessage =
          response?.result ||
          response?.data?.result ||
          response?.data ||
          response;


        // Replace temp message with real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...sentMessage, isPending: false }
              : msg
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
        showToast("Không thể gửi tin nhắn. Vui lòng thử lại.", "error");
      } finally {
        setSending(false);
      }
    },
    [newMessage, selectedConversation, currentUser, propertyContext, messages]
  );

  // Handle message received (socket)
  const handleMessageReceived = useCallback(
    (data) => {

      const msgConvId = data.conversationId;
      const currentConvId = currentConversationRef.current;

      if (!currentConvId || msgConvId !== currentConvId) {
        return;
      }

      setMessages((prev) => {
        const msgId = data.id || data.messageId;

        // Block duplicates
        if (prev.some((msg) => msg.id === msgId)) {
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
    },
    [loadConversations]
  );

  // Handle message sent (socket)
  const handleMessageSent = useCallback((data) => {

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


    registerMessageCallbacks({
      onMessageReceived: handleMessageReceived,
      onMessageSent: handleMessageSent,
    });
  }, [registerMessageCallbacks, handleMessageReceived, handleMessageSent]);

  // Search users
  const handleSearchUsers = useCallback(async () => {
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
  }, [searchTerm]);

  // Create conversation
  const handleCreateConversation = useCallback(
    async (userId) => {
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
        showToast("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.", "error");
      }
    },
    [loadMessages]
  );

  // Remove property context
  const handleRemovePropertyContext = useCallback(() => {
    setPropertyContext(null);
    navigate("/messages", { replace: true });
  }, [navigate]);

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

    //  Refresh
    refreshConversations,
    loadConversations,
  };
};