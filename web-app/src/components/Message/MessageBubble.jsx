import React from "react";
import { Loader } from "lucide-react";

const MessageBubble = ({ message, isOwn, formatTime }) => {
  const isMine = message.me !== undefined ? message.me : isOwn;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] ${
          isMine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
        } rounded-2xl px-4 py-2 ${message.isPending ? "opacity-50" : ""}`}
      >
        {!isMine && message.sender && (
          <p className="text-xs font-semibold mb-1 text-gray-600">
            {message.sender.firstName} {message.sender.lastName}
          </p>
        )}

        <p className="text-sm break-words">
          {message.message || message.content}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <p
            className={`text-xs ${isMine ? "text-blue-100" : "text-gray-500"}`}
          >
            {formatTime(
              message.createdDate || message.createdAt || message.timestamp
            )}
          </p>
          {message.isPending && <Loader className="w-3 h-3 animate-spin" />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
