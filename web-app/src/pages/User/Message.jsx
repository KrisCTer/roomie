import React, { useState, useEffect, useRef } from "react";
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
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
} from "../../services/chat.service";
import { searchUsers } from "../../services/user.service";
import { getToken, getUserInfo } from "../../services/localStorageService";

// ========== WEBSOCKET CONFIG ==========
const SOCKET_URL = "http://localhost:8099";

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

  // WebSocket
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Property context (from navigation)
  const [propertyContext, setPropertyContext] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // ========== HANDLE NAVIGATION FROM PROPERTY DETAIL ==========
  useEffect(() => {
    if (location.state) {
      const { conversationId, propertyId, propertyTitle, ownerId, ownerName } =
        location.state;

      // Save property context
      if (propertyId) {
        setPropertyContext({
          propertyId,
          propertyTitle,
          ownerId,
          ownerName,
        });
      }

      // If conversationId is provided, select it after loading conversations
      if (conversationId) {
        // We'll handle this after conversations are loaded
        sessionStorage.setItem("pendingConversationId", conversationId);
      }
    }
  }, [location.state]);

  // ========== WEBSOCKET CONNECTION ==========
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socketInstance = io(SOCKET_URL, {
      query: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
      setConnected(false);
    });

    socketInstance.on("message", (data) => {
      console.log("📩 Received message:", data);
      handleReceiveMessage(data);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

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
      setConversations(convList);

      // Check if there's a pending conversation to select
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
      console.error("Error loading conversations:", error);
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
      setMessages(msgList);
      scrollToBottom();
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== SELECT CONVERSATION ==========
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    const convId = conversation.conversationId || conversation.id;
    loadMessages(convId);
  };

  // ========== SEND MESSAGE ==========
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const currentUser = getUserInfo();
    if (!currentUser) {
      alert("Vui lòng đăng nhập để gửi tin nhắn");
      return;
    }

    try {
      setSending(true);
      const convId =
        selectedConversation.conversationId || selectedConversation.id;

      const payload = {
        conversationId: convId,
        message: newMessage.trim(),
      };

      console.log("📤 Sending message:", payload);
      const response = await createMessage(payload);
      const sentMessage =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      console.log("✅ Message sent:", sentMessage);

      // Add message to local state
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      scrollToBottom();

      // Emit via WebSocket
      if (socket && connected) {
        socket.emit("message", sentMessage);
      }

      // Add property context as first message if it exists
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
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // ========== RECEIVE MESSAGE ==========
  const handleReceiveMessage = (data) => {
    const currentUser = getUserInfo();
    if (!currentUser) return;

    const convId =
      selectedConversation?.conversationId || selectedConversation?.id;
    const msgConvId = data.conversationId || data.conversation?.conversationId;

    if (convId && msgConvId === convId) {
      setMessages((prev) => {
        // Avoid duplicates
        const exists = prev.some(
          (msg) =>
            (msg.messageId && msg.messageId === data.messageId) ||
            (msg.id && msg.id === data.id)
        );
        if (exists) return prev;
        return [...prev, data];
      });
      scrollToBottom();
    }

    // Update conversation list (move to top)
    setConversations((prev) => {
      const updated = prev.filter((c) => {
        const cId = c.conversationId || c.id;
        return cId !== msgConvId;
      });
      const targetConv = prev.find((c) => {
        const cId = c.conversationId || c.id;
        return cId === msgConvId;
      });
      if (targetConv) {
        return [{ ...targetConv, lastMessage: data }, ...updated];
      }
      return prev;
    });
  };

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
    }, 100);
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

  // Get current user
  const currentUser = getUserInfo();

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
                      connected
                        ? "fill-green-500 text-green-500"
                        : "fill-gray-400 text-gray-400"
                    }`}
                  />
                  <span
                    className={connected ? "text-green-600" : "text-gray-500"}
                  >
                    {connected ? "Đã kết nối" : "Đang kết nối..."}
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
                      <button className="p-2 hover:bg-gray-100 rounded-full transition">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition">
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
                          key={msg.messageId || msg.id}
                          message={msg}
                          isOwn={
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
    otherParticipant?.fullName ||
    otherParticipant?.username ||
    "Unknown User";

  const lastMsg = conversation.lastMessage;
  const lastMsgText = lastMsg?.message || lastMsg?.content || "No messages yet";
  const lastMsgTime = formatTime(lastMsg?.createdAt || lastMsg?.timestamp);

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
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] ${
          isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
        } rounded-2xl px-4 py-2`}
      >
        <p className="text-sm break-words">
          {message.message || message.content}
        </p>
        <p
          className={`text-xs mt-1 ${
            isOwn ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatTime(message.createdAt || message.timestamp)}
        </p>
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
  if (conversation.name) return conversation.name;

  const otherParticipant = conversation.participants?.find(
    (p) => (p.userId || p.id) !== currentUserId
  );

  return (
    otherParticipant?.fullName || otherParticipant?.username || "Unknown User"
  );
};

export default Message;
