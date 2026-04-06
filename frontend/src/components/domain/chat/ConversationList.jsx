import React from "react";
import { Search, Send, Loader, Home as HomeIcon, Circle } from "lucide-react";
import ConversationItem from "./ConversationItem";

const ConversationList = ({
  conversations,
  selectedConversation,
  loading,
  isConnected,
  propertyContext,
  currentUserId,
  onSelectConversation,
  onOpenSearch,
  onRemovePropertyContext,
  formatTime,
}) => {
  return (
    <div className="w-full md:w-96 border-r border-white/45 bg-white/18 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/45">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-[#2B2A28]">Messages</h2>
          <button
            onClick={onOpenSearch}
            className="home-glass-soft p-2 hover:bg-white/50 rounded-full transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Property Context Banner */}
        {propertyContext && (
          <div className="mb-3 p-3 bg-white/45 border border-white/60 rounded-lg">
            <div className="flex items-start gap-2">
              <HomeIcon className="w-4 h-4 text-[#CC6F4A] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#CC6F4A] font-medium mb-1">
                  Về bất động sản:
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {propertyContext.propertyTitle}
                </p>
                <button
                  onClick={onRemovePropertyContext}
                  className="text-xs text-[#CC6F4A] hover:underline mt-1"
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
          <span className={isConnected ? "text-green-600" : "text-gray-500"}>
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
            <div className="text-[#CC6F4A] mb-2">
              <Send className="w-12 h-12" />
            </div>
            <p className="text-gray-600 mb-4">Chưa có cuộc trò chuyện nào</p>
            <button
              onClick={onOpenSearch}
              className="px-4 py-2 bg-[#CC6F4A] text-white rounded-lg hover:bg-[#B5604B] transition"
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
                  selectedConversation?.id) === (conv.conversationId || conv.id)
              }
              onClick={() => onSelectConversation(conv)}
              formatTime={formatTime}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
