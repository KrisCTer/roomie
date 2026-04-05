import React from "react";
import { Loader } from "lucide-react";
import MessageBubble from "./MessageBubble";

const MessageList = ({
  messages,
  loading,
  currentUserId,
  messagesEndRef,
  formatTime,
}) => {
  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Chưa có tin nhắn nào
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id || msg.messageId}
          message={msg}
          isOwn={
            msg.me || (msg.senderId || msg.sender?.userId) === currentUserId
          }
          formatTime={formatTime}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
