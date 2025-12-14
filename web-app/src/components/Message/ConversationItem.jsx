import React from "react";

const ConversationItem = ({
  conversation,
  selected,
  onClick,
  formatTime,
  currentUserId,
}) => {
  const otherParticipant = conversation.participants?.find(
    (p) => (p.userId || p.id) !== currentUserId
  );

  const displayName =
    conversation.name ||
    conversation.conversationName ||
    otherParticipant?.fullName ||
    otherParticipant?.username ||
    "Unknown User";

  const lastMsg = conversation.lastMessage;
  const lastMsgText = lastMsg?.message || lastMsg?.content || "No messages yet";
  const lastMsgTime = formatTime(
    conversation.lastMessageTime ||
      lastMsg?.createdDate ||
      lastMsg?.createdAt ||
      lastMsg?.timestamp
  );

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
        selected ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold truncate">{displayName}</h4>
            <span className="text-xs text-gray-500">{lastMsgTime}</span>
          </div>
          <p className="text-sm text-gray-600 truncate">{lastMsgText}</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
