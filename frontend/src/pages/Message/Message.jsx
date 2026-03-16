/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
// web-app/src/pages/Message/Message.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import CallModal from "../../components/layout/layoutUser/CallModal.jsx";
import { useCall } from "../../contexts/CallContext.jsx";
import { useTranslation } from "react-i18next";
import { useRefresh } from "../../contexts/RefreshContext";

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

  //  Refresh context
  const { registerRefreshCallback, unregisterRefreshCallback } = useRefresh();

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
    refreshConversations,
  } = useChatOperations();

  //  Register refresh callback
  useEffect(() => {
    registerRefreshCallback("messages", refreshConversations);

    return () => {
      unregisterRefreshCallback("messages");
    };
  }, [
    registerRefreshCallback,
    unregisterRefreshCallback,
    refreshConversations,
  ]);

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

    const remotePeer = findRemotePeer(
      selectedConversation.participants,
      currentUser.userId || currentUser.id || currentUser.sub
    );

    if (!remotePeer) {
      alert(t("message.recipientNotFound"));
      return;
    }

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

    const remotePeer = findRemotePeer(
      selectedConversation.participants,
      currentUser.userId || currentUser.id || currentUser.sub
    );

    if (!remotePeer) {
      alert(t("message.recipientNotFound"));
      return;
    }

    startCall(
      selectedConversation.id || selectedConversation.conversationId,
      remotePeer,
      "video"
    );
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

        <main className="flex-1">
          <div className="h-[calc(100vh-73px)] flex">
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

            <CallModal />
          </div>
        </main>
      </div>

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
          }}
        />
      )}
    </div>
  );
};

export default Message;


