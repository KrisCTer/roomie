import React from "react";
import { Send, Loader } from "lucide-react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatArea = ({
  selectedConversation,
  messages,
  loading,
  newMessage,
  sending,
  currentUserId,
  messagesEndRef,
  callState,
  onVoiceCall,
  onVideoCall,
  onMessageChange,
  onSendMessage,
  formatTime,
}) => {
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
        <Send className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
        <p className="text-sm text-center max-w-md">
          Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu cuộc trò
          chuyện mới
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <ChatHeader
        conversation={selectedConversation}
        currentUserId={currentUserId}
        callState={callState}
        onVoiceCall={onVoiceCall}
        onVideoCall={onVideoCall}
      />

      {/* Messages */}
      <MessageList
        messages={messages}
        loading={loading}
        currentUserId={currentUserId}
        messagesEndRef={messagesEndRef}
        formatTime={formatTime}
      />

      {/* Input */}
      <MessageInput
        newMessage={newMessage}
        sending={sending}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
      />
    </>
  );
};

export default ChatArea;
