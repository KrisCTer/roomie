import React from "react";
import { Phone, Video, MoreVertical } from "lucide-react";
import { getConversationName } from "../../utils/chatHelpers";

const ChatHeader = ({
  conversation,
  currentUserId,
  callState,
  onVoiceCall,
  onVideoCall,
}) => {
  const displayName = getConversationName(conversation, currentUserId);

  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold">{displayName}</h3>
          <p className="text-xs text-gray-500">
            {conversation.type === "DIRECT" ? "Direct message" : "Group chat"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onVoiceCall}
          disabled={callState.isInCall || callState.isRinging}
          className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Voice Call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={onVideoCall}
          disabled={callState.isInCall || callState.isRinging}
          className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Video Call"
        >
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
