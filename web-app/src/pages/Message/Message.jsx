import React, { useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import CallModal from "../../components/layout/layoutUser/CallModal.jsx";
import { useCall } from "../../contexts/CallContext.jsx";
import { useTranslation } from "react-i18next";

// Import custom components
import ConversationList from "../../components/Message/ConversationList.jsx";
import ChatArea from "../../components/Message/ChatArea.jsx";
import SearchModal from "../../components/Message/SearchModal.jsx";

// Import custom hook
import { useChatOperations } from "../../hooks/useChatOperations.js";

// Import utilities
import { formatTime, formatMessageTime } from "../../utils/chatHelpers.js";
import { findRemotePeer } from "../../utils/participantHelpers.js";

const Message = () => {
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Message");
  const { t } = useTranslation();

  // Call context
  const { startCall, callState } = useCall();

  // Use custom hook for all chat operations
  const {
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
    setNewMessage,
    setSearchTerm,
    setShowSearchModal,
    handleSelectConversation,
    handleSendMessage,
    handleSearchUsers,
    handleCreateConversation,
    handleRemovePropertyContext,
  } = useChatOperations();

  // Handle voice call
  const handleVoiceCall = () => {
    if (!selectedConversation) {
      alert(t("message.selectConversation"));
      return;
    }

    if (!currentUser) {
      alert(t("message.userNotLoaded"));
      return;
    }

    // Use helper to find remote peer
    const remotePeer = findRemotePeer(
      selectedConversation.participants,
      currentUser.userId || currentUser.id || currentUser.sub
    );

    if (!remotePeer) {
      alert(t("message.recipientNotFound"));
      return;
    }

    console.log("📞 Starting voice call with:", remotePeer);
    startCall(
      selectedConversation.id || selectedConversation.conversationId,
      remotePeer,
      "voice"
    );
  };

  // Handle video call
  const handleVideoCall = () => {
    if (!selectedConversation) {
      alert(t("message.selectConversation"));
      return;
    }

    if (!currentUser) {
      alert(t("message.userNotLoaded"));
      return;
    }

    // Use helper to find remote peer
    const remotePeer = findRemotePeer(
      selectedConversation.participants,
      currentUser.userId || currentUser.id || currentUser.sub
    );

    if (!remotePeer) {
      alert(t("message.recipientNotFound"));
      return;
    }

    console.log("📹 Starting video call with:", remotePeer);
    startCall(
      selectedConversation.id || selectedConversation.conversationId,
      remotePeer,
      "video"
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1">
          <div className="h-[calc(100vh-73px)] flex">
            {/* Conversations List */}
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              loading={loading}
              isConnected={isConnected}
              propertyContext={propertyContext}
              currentUserId={currentUser?.userId}
              onSelectConversation={handleSelectConversation}
              onOpenSearch={() => setShowSearchModal(true)}
              onRemovePropertyContext={handleRemovePropertyContext}
              formatTime={formatTime}
            />

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
              <ChatArea
                selectedConversation={selectedConversation}
                messages={messages}
                loading={loading}
                newMessage={newMessage}
                sending={sending}
                currentUserId={currentUser?.userId}
                messagesEndRef={messagesEndRef}
                callState={callState}
                onVoiceCall={handleVoiceCall}
                onVideoCall={handleVideoCall}
                onMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
                formatTime={formatMessageTime}
              />
            </div>

            {/* Call Modal */}
            <CallModal />
          </div>
        </main>

        {/* <Footer /> */}
      </div>

      {/* Search Modal */}
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
            // setSearchResults([]);
          }}
        />
      )}
    </div>
  );
};

export default Message;
