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
    <div className="w-full md:w-96 bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Messages</h2>
          <button
            onClick={onOpenSearch}
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
                  onClick={onRemovePropertyContext}
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
            <div className="text-gray-400 mb-2">
              <Send className="w-12 h-12" />
            </div>
            <p className="text-gray-600 mb-4">Chưa có cuộc trò chuyện nào</p>
            <button
              onClick={onOpenSearch}
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
