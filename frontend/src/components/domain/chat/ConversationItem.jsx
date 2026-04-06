import React from "react";
import { getAttachmentPreviewText } from "../../../utils/chatAttachmentHelpers";

const ConversationItem = ({
  conversation,
  selected,
  onClick,
  formatTime,
  currentUserId,
}) => {
  const otherParticipant = conversation.participants?.find(
    (p) => (p.userId || p.id) !== currentUserId,
  );

  const displayName =
    conversation.name ||
    conversation.conversationName ||
    otherParticipant?.fullName ||
    otherParticipant?.username ||
    "Unknown User";
  const avatarUrl =
    conversation.conversationAvatar ||
    otherParticipant?.avatar ||
    otherParticipant?.avatarUrl ||
    "";

  const lastMsg = conversation.lastMessage;
  const lastMsgText = getAttachmentPreviewText(
    lastMsg?.message || lastMsg?.content || "",
  );
  const lastMsgTime = formatTime(
    conversation.lastMessageTime ||
      lastMsg?.createdDate ||
      lastMsg?.createdAt ||
      lastMsg?.timestamp,
  );

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-white/35 cursor-pointer hover:bg-white/35 transition ${
        selected ? "bg-white/55" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#CC6F4A] flex items-center justify-center text-white font-semibold flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
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
