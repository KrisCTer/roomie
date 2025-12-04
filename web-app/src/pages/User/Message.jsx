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
} from "lucide-react";
import { io } from "socket.io-client";
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
import { getToken } from "../../services/localStorageService";

// ========== WEBSOCKET CONFIG ==========
const SOCKET_URL = "http://localhost:8099";

const Message = () => {
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

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

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
      console.log("WebSocket connected");
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    });

    socketInstance.on("message", (data) => {
      console.log("Received message:", data);
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
      setConversations(response.result || []);
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
      setMessages(response.result || []);
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
    loadMessages(conversation.id);
  };

  // ========== SEND MESSAGE ==========
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const payload = {
        conversationId: selectedConversation.id,
        message: newMessage.trim(),
      };

      const response = await createMessage(payload);

      // Add message to local state
      setMessages((prev) => [...prev, response.result]);
      setNewMessage("");
      scrollToBottom();

      // Emit via WebSocket
      if (socket && connected) {
        socket.emit("message", response.result);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // ========== RECEIVE MESSAGE ==========
  const handleReceiveMessage = (data) => {
    if (
      selectedConversation &&
      data.conversationId === selectedConversation.id
    ) {
      setMessages((prev) => {
        // Avoid duplicates
        const exists = prev.some((msg) => msg.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });
      scrollToBottom();
    }

    // Update conversation list (move to top)
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== data.conversationId);
      const targetConv = prev.find((c) => c.id === data.conversationId);
      if (targetConv) {
        return [targetConv, ...updated];
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
      setSearchResults(response.result || []);
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
      const newConv = response.result;

      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setShowSearchModal(false);
      setSearchTerm("");
      setSearchResults([]);
      loadMessages(newConv.id);
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
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

        <main className="p-4 h-[calc(100vh-80px)]">
          <div className="flex gap-4 h-full">
            {/* ========== LEFT SIDEBAR: CONVERSATIONS ========== */}
            <div className="w-80 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Tin Nhắn</h2>
                  <div className="flex items-center gap-2">
                    {connected ? (
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    ) : (
                      <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                    )}
                    <button
                      onClick={() => setShowSearchModal(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Search className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Search box */}
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
                    <Search className="w-12 h-12 mb-3" />
                    <p className="text-center text-sm">
                      Chưa có cuộc trò chuyện nào.
                      <br />
                      Tìm kiếm người dùng để bắt đầu chat!
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 ${
                        selectedConversation?.id === conversation.id
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            conversation.conversationAvatar ||
                            "https://ui-avatars.com/api/?name=" +
                              (conversation.conversationName || "User")
                          }
                          alt={conversation.conversationName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {connected && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {conversation.conversationName || "Người dùng"}
                          </h3>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTime(conversation.modifiedDate)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage || "Bắt đầu trò chuyện..."}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ========== RIGHT PANEL: CHAT ========== */}
            <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          selectedConversation.conversationAvatar ||
                          "https://ui-avatars.com/api/?name=" +
                            (selectedConversation.conversationName || "User")
                        }
                        alt={selectedConversation.conversationName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.conversationName ||
                            "Người dùng"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {connected ? "Đang hoạt động" : "Ngoại tuyến"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Video className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                    {loading && messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Chưa có tin nhắn. Gửi tin nhắn đầu tiên!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isMe = message.me;
                          const showAvatar =
                            index === 0 ||
                            messages[index - 1].me !== message.me;

                          return (
                            <div
                              key={message.id}
                              className={`flex items-end gap-2 ${
                                isMe ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              {showAvatar && !isMe ? (
                                <img
                                  src={
                                    message.sender?.avatar ||
                                    "https://ui-avatars.com/api/?name=" +
                                      (message.sender?.username || "User")
                                  }
                                  alt={message.sender?.username}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8"></div>
                              )}

                              <div
                                className={`max-w-md ${
                                  isMe ? "items-end" : "items-start"
                                } flex flex-col`}
                              >
                                <div
                                  className={`px-4 py-2 rounded-2xl ${
                                    isMe
                                      ? "bg-blue-600 text-white rounded-br-sm"
                                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                                  }`}
                                >
                                  <p className="text-sm break-words">
                                    {message.message}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400 mt-1 px-2">
                                  {formatMessageTime(message.createdDate)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="px-6 py-4 border-t border-gray-200">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-3"
                    >
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Paperclip className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <ImageIcon className="w-5 h-5 text-gray-600" />
                      </button>

                      <input
                        ref={messageInputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                      />

                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Smile className="w-5 h-5 text-gray-600" />
                      </button>

                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        {sending ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Send className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Chọn một cuộc trò chuyện
                    </h3>
                    <p className="text-sm">
                      Chọn một cuộc trò chuyện bên trái để bắt đầu nhắn tin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* ========== SEARCH MODAL ========== */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Tìm Kiếm Người Dùng
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchUsers()}
                  placeholder="Nhập tên người dùng..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearchUsers}
                  disabled={searching}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                >
                  {searching ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  {searchTerm
                    ? "Không tìm thấy kết quả"
                    : "Nhập tên để tìm kiếm"}
                </p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.userId}
                      onClick={() => handleCreateConversation(user.userId)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <img
                        src={
                          user.avatar ||
                          "https://ui-avatars.com/api/?name=" +
                            (user.username || "User")
                        }
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
