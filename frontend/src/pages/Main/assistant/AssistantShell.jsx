import React from "react";
import { useLocation } from "react-router-dom";
import useAssistantChat from "./hooks/useAssistantChat";
import AssistantFloatingButton from "./sections/AssistantFloatingButton";
import AssistantDrawer from "./sections/AssistantDrawer";

const AssistantShell = () => {
  const location = useLocation();

  const {
    open,
    setOpen,
    messages,
    input,
    setInput,
    loading,
    conversations,
    showConversations,
    setShowConversations,
    currentConversationId,
    quickPrompts,
    messagesEndRef,
    dragRef,
    handleSend,
    handleDeleteConversation,
    handleUseQuickPrompt,
    handleNewConversation,
    handleSelectConversation,
    handleInputKeyPress,
    formatMessageTime,
  } = useAssistantChat({ pathname: location.pathname });

  return (
    <>
      <AssistantFloatingButton
        open={open}
        setOpen={setOpen}
        dragRef={dragRef}
      />
      <AssistantDrawer
        open={open}
        setOpen={setOpen}
        conversations={conversations}
        currentConversationId={currentConversationId}
        showConversations={showConversations}
        setShowConversations={setShowConversations}
        handleSelectConversation={handleSelectConversation}
        handleDeleteConversation={handleDeleteConversation}
        handleNewConversation={handleNewConversation}
        formatMessageTime={formatMessageTime}
        messages={messages}
        loading={loading}
        quickPrompts={quickPrompts}
        handleUseQuickPrompt={handleUseQuickPrompt}
        input={input}
        setInput={setInput}
        handleInputKeyPress={handleInputKeyPress}
        handleSend={handleSend}
        messagesEndRef={messagesEndRef}
      />
    </>
  );
};

export default AssistantShell;
