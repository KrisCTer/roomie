/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
// web-app/src/pages/Message/Message.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import CallModal from "../../components/layout/layoutUser/CallModal.jsx";
import { useCall } from "../../contexts/CallContext.jsx";
import { useTranslation } from "react-i18next";
import { useRefresh } from "../../contexts/RefreshContext";
import { useDialog } from "../../contexts/DialogContext";
import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

// Import custom components
import ConversationList from "../../components/domain/chat/ConversationList.jsx";
import ChatArea from "../../components/domain/chat/ChatArea.jsx";
import SearchModal from "../../components/domain/chat/SearchModal.jsx";

// Import custom hook
import { useChatOperations } from "../../hooks/chat/useChatOperations.js";

// Import utilities
import { formatTime, formatMessageTime } from "../../utils/chatHelpers.js";
import { findRemotePeer } from "../../utils/participantHelpers.js";

const Message = () => {
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Message");
  const { t } = useTranslation();
  const { showToast } = useDialog();

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
      showToast(t("message.selectConversation"), "warning");
      return;
    }

    if (!currentUser) {
      showToast(t("message.userNotLoaded"), "warning");
      return;
    }

    const remotePeer = findRemotePeer(
      selectedConversation.participants,
      currentUser.userId || currentUser.id || currentUser.sub
    );

    if (!remotePeer) {
      showToast(t("message.recipientNotFound"), "warning");
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
      showToast(t("message.selectConversation"), "warning");
      return;
    }

    if (!currentUser) {
      showToast(t("message.userNotLoaded"), "warning");
      return;
    }

    const remotePeer = findRemotePeer(
      selectedConversation.participants,
      currentUser.userId || currentUser.id || currentUser.sub
    );

    if (!remotePeer) {
      showToast(t("message.recipientNotFound"), "warning");
      return;
    }

    startCall(
      selectedConversation.id || selectedConversation.conversationId,
      remotePeer,
      "video"
    );
  };

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
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

        <main className="flex-1 px-4 pb-4 md:px-8">
          <div className="apple-glass-panel overflow-hidden h-[calc(100vh-73px)] flex">
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

            <div className="flex-1 flex flex-col">
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


