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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="home-glass-soft rounded-2xl px-8 py-10 text-center text-gray-600">
          <Send className="w-16 h-16 mb-4 mx-auto text-[#CC6F4A]" />
          <h3 className="text-xl font-semibold mb-2 text-[#2B2A28]">
            Chọn một cuộc trò chuyện
          </h3>
          <p className="text-sm text-center max-w-md">
            Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu cuộc trò
            chuyện mới
          </p>
        </div>
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
