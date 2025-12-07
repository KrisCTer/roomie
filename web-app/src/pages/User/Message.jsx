import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Circle,
  Loader,
  ArrowLeft,
  Home as HomeIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import { useCall } from "../../contexts/CallContext";
import CallModal from "../../components/layout/layoutUser/CallModal";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
} from "../../services/chat.service";
import { searchUsers } from "../../services/user.service";
import { getToken, getUserInfo } from "../../services/localStorageService";
import { useSocket } from "../../contexts/SocketContext";

const Message = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Message");

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

  // Property context (from navigation)
  const [propertyContext, setPropertyContext] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const currentConversationRef = useRef(null);
  const { startCall, callState } = useCall();
  // ⭐ USE SOCKET CONTEXT
  // const { isConnected, registerMessageCallbacks } = useSocket();
  const { isConnected, registerMessageCallbacks, sendMessage } = useSocket();
  // ========== UPDATE CURRENT CONVERSATION REF ==========

  console.log("Socket:", isConnected); // Should be SocketIO instance
  console.log("Connected:", registerMessageCallbacks); // Should be true
  console.log("Send Message Func:", sendMessage); // Should be function

  useEffect(() => {
    const convId =
      selectedConversation?.conversationId || selectedConversation?.id;
    currentConversationRef.current = convId;
    console.log("📌 Current conversation ref updated:", convId);
  }, [selectedConversation]);

  // Get current user
  const currentUser = getUserInfo();

  // ========== HANDLE NAVIGATION FROM PROPERTY DETAIL ==========
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

  // ========== LOAD CONVERSATIONS ==========
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

  // ========== LOAD MESSAGES ==========
  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await getMessages(conversationId);
      const msgList =
        response?.result || response?.data?.result || response?.data || [];

      console.log("📨 Loaded messages:", msgList.length);
      setMessages(msgList);
      scrollToBottom();
    } catch (error) {
      console.error("❌ Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCall = () => {
    if (!selectedConversation) {
      alert("Please select a conversation first");
      return;
    }

    const remotePeer = selectedConversation.participants?.find(
      (p) => p.userId !== currentUser?.userId
    );

    if (!remotePeer) {
      alert("Cannot find recipient");
      return;
    }

    console.log("📞 Starting voice call with:", remotePeer);
    startCall(
      selectedConversation.id || selectedConversation.conversationId,
      remotePeer,
      "voice"
    );
  };
  const handleVideoCall = () => {
    if (!selectedConversation) {
      alert("Please select a conversation first");
      return;
    }

    const remotePeer = selectedConversation.participants?.find(
      (p) => p.userId !== currentUser?.userId
    );

    if (!remotePeer) {
      alert("Cannot find recipient");
      return;
    }

    console.log("📹 Starting video call with:", remotePeer);
    startCall(
      selectedConversation.id || selectedConversation.conversationId,
      remotePeer,
      "video"
    );
  };
  // ========== SELECT CONVERSATION ==========
  // const handleSelectConversation = useCallback((conversation) => {
  //   const convId = conversation.conversationId || conversation.id;
  //   console.log("📂 Selecting conversation:", convId);

  //   setSelectedConversation(conversation);
  //   currentConversationRef.current = convId;
  //   loadMessages(convId);
  // }, []);
  const handleSelectConversation = useCallback((conversation) => {
    const convId = conversation.conversationId || conversation.id;

    setSelectedConversation(conversation);
    currentConversationRef.current = convId;
    loadMessages(convId);

    // ⭐ Join socket room
    if (sendMessage) {
      // sendMessage("join_conversation", convId);
      sendMessage("join_conversation", { conversationId: convId });
      console.log("🔔 Joined socket room for conversation:", convId);
    }
  }, []);

  // ========== SEND MESSAGE ==========
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
    scrollToBottom();

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

      // Refresh conversations to update last message
      // loadConversations();

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

  // ========== HANDLE MESSAGE RECEIVED (SOCKET) ==========
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

      // 1️⃣ Block duplicates
      if (prev.some((msg) => msg.id === msgId)) {
        console.log("⚠️ Duplicate message blocked");
        return prev;
      }

      // 2️⃣ Replace temp message
      const tempIndex = prev.findIndex(
        (m) => m.isPending && m.message === data.message
      );

      if (tempIndex !== -1) {
        const updated = [...prev];
        updated[tempIndex] = { ...data, isPending: false };
        return updated;
      }

      // 3️⃣ Append normally
      return [...prev, data];
    });
    setConversations((prev) => {
      const convId = data.conversationId;
      const exists = prev.some((c) => (c.conversationId || c.id) === convId);

      // Nếu conversation chưa có trong list -> reload
      if (!exists) {
        loadConversations();
        return prev;
      }

      // Cập nhật last message
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

    scrollToBottom();
  }, []);
  // ⭐ Empty deps - uses ref, not state

  // ========== HANDLE MESSAGE SENT (SOCKET) ==========
  const handleMessageSent = useCallback((data) => {
    console.log("📤 Message sent event:", data);

    // Refresh conversations
    // loadConversations();

    // Update message if in current conversation
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
  }, []); // ⭐ Empty deps - uses ref

  // ========== REGISTER SOCKET CALLBACKS ==========
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
  }, []); // ⭐ Only depend on registerMessageCallbacks, NOT on the handlers

  // ========== SEARCH USERS ==========
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

  // ========== CREATE CONVERSATION ==========
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

  // ========== SCROLL TO BOTTOM ==========
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  };

  // ========== FORMAT TIME ==========
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? "Vừa xong" : `${diffInMinutes} phút trước`;
    }
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 48) return "Hôm qua";
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ========== RENDER ==========
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1">
          <div className="h-[calc(100vh-73px)] flex">
            {/* CONVERSATIONS LIST */}
            <div className="w-full md:w-96 bg-white border-r flex flex-col">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Messages</h2>
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                {/* Property Context Banner */}
                {propertyContext && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <HomeIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          Về bất động sản:
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {propertyContext.propertyTitle}
                        </p>
                        <button
                          onClick={() => {
                            setPropertyContext(null);
                            navigate("/messages", { replace: true });
                          }}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Xóa ngữ cảnh
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connection Status */}
                <div className="flex items-center gap-2 text-xs">
                  <Circle
                    className={`w-2 h-2 ${
                      isConnected
                        ? "fill-green-500 text-green-500"
                        : "fill-gray-400 text-gray-400"
                    }`}
                  />
                  <span
                    className={isConnected ? "text-green-600" : "text-gray-500"}
                  >
                    {isConnected ? "Đã kết nối" : "Đang kết nối..."}
                  </span>
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="text-gray-400 mb-2">
                      <Send className="w-12 h-12" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      Chưa có cuộc trò chuyện nào
                    </p>
                    <button
                      onClick={() => setShowSearchModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Bắt đầu trò chuyện
                    </button>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <ConversationItem
                      key={conv.conversationId || conv.id}
                      conversation={conv}
                      selected={
                        (selectedConversation?.conversationId ||
                          selectedConversation?.id) ===
                        (conv.conversationId || conv.id)
                      }
                      onClick={() => handleSelectConversation(conv)}
                      formatTime={formatTime}
                      currentUserId={currentUser?.userId}
                    />
                  ))
                )}
              </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 flex flex-col bg-white">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {getConversationName(
                          selectedConversation,
                          currentUser?.userId
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {getConversationName(
                            selectedConversation,
                            currentUser?.userId
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.type === "DIRECT"
                            ? "Direct message"
                            : "Group chat"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleVoiceCall}
                        disabled={callState.isInCall || callState.isRinging}
                        className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Voice Call"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleVideoCall}
                        disabled={callState.isInCall || callState.isRinging}
                        className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Video Call"
                      >
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading && messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Chưa có tin nhắn nào
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <MessageBubble
                          key={msg.id || msg.messageId}
                          message={msg}
                          isOwn={
                            msg.me ||
                            (msg.senderId || msg.sender?.userId) ===
                              currentUser?.userId
                          }
                          formatTime={formatMessageTime}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t flex items-center gap-3"
                  >
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <ImageIcon className="w-5 h-5 text-gray-600" />
                    </button>

                    <input
                      ref={messageInputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />

                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <Smile className="w-5 h-5 text-gray-600" />
                    </button>

                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                  <Send className="w-16 h-16 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Chọn một cuộc trò chuyện
                  </h3>
                  <p className="text-sm text-center max-w-md">
                    Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu
                    cuộc trò chuyện mới
                  </p>
                </div>
              )}
            </div>
            <CallModal />
          </div>
        </main>

        <Footer />
      </div>

      {/* SEARCH MODAL */}
      {showSearchModal && (
        <SearchModal
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchResults={searchResults}
          searching={searching}
          onSearch={handleSearchUsers}
          onCreate={handleCreateConversation}
          onClose={() => {
            setShowSearchModal(false);
            setSearchTerm("");
            setSearchResults([]);
          }}
        />
      )}
    </div>
  );
};

// ========== SUB COMPONENTS ==========
const ConversationItem = ({
  conversation,
  selected,
  onClick,
  formatTime,
  currentUserId,
}) => {
  const otherParticipant = conversation.participants?.find(
    (p) => (p.userId || p.id) !== currentUserId
  );

  const displayName =
    conversation.name ||
    conversation.conversationName ||
    otherParticipant?.fullName ||
    otherParticipant?.username ||
    "Unknown User";

  const lastMsg = conversation.lastMessage;
  const lastMsgText = lastMsg?.message || lastMsg?.content || "No messages yet";
  const lastMsgTime = formatTime(
    conversation.lastMessageTime ||
      lastMsg?.createdDate ||
      lastMsg?.createdAt ||
      lastMsg?.timestamp
  );

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
        selected ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold truncate">{displayName}</h4>
            <span className="text-xs text-gray-500">{lastMsgTime}</span>
          </div>
          <p className="text-sm text-gray-600 truncate">{lastMsgText}</p>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwn, formatTime }) => {
  const isMine = message.me !== undefined ? message.me : isOwn;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] ${
          isMine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
        } rounded-2xl px-4 py-2 ${message.isPending ? "opacity-50" : ""}`}
      >
        {!isMine && message.sender && (
          <p className="text-xs font-semibold mb-1 text-gray-600">
            {message.sender.firstName} {message.sender.lastName}
          </p>
        )}

        <p className="text-sm break-words">
          {message.message || message.content}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <p
            className={`text-xs ${isMine ? "text-blue-100" : "text-gray-500"}`}
          >
            {formatTime(
              message.createdDate || message.createdAt || message.timestamp
            )}
          </p>
          {message.isPending && <Loader className="w-3 h-3 animate-spin" />}
        </div>
      </div>
    </div>
  );
};

const SearchModal = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  searching,
  onSearch,
  onCreate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Tìm kiếm người dùng</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onSearch()}
              placeholder="Nhập tên hoặc email..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={onSearch}
              disabled={searching || !searchTerm.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {searching ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchTerm && !searching
                  ? "Không tìm thấy người dùng"
                  : "Nhập tên để tìm kiếm"}
              </p>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.userId || user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {(user.fullName || user.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onCreate(user.userId || user.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Nhắn tin
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
const getConversationName = (conversation, currentUserId) => {
  if (conversation.name || conversation.conversationName) {
    return conversation.name || conversation.conversationName;
  }

  const otherParticipant = conversation.participants?.find(
    (p) => (p.userId || p.id) !== currentUserId
  );

  return (
    otherParticipant?.fullName || otherParticipant?.username || "Unknown User"
  );
};

export default Message;
