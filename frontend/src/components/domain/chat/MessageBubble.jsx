import React from "react";
import { Loader } from "lucide-react";
import {
  formatFileSize,
  parseAttachmentMessage,
} from "../../../utils/chatAttachmentHelpers";

const MessageBubble = ({ message, isOwn, formatTime }) => {
  const isMine = message.me !== undefined ? message.me : isOwn;
  const parsed = parseAttachmentMessage(
    message.message || message.content || "",
  );
  const bubbleClass = isMine
    ? "bg-[#CC6F4A] text-white"
    : "bg-white/80 text-[#2B2A28] border border-white/60";

  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2 ${bubbleClass} ${
          message.isPending ? "opacity-50" : ""
        }`}
      >
        {!isMine && message.sender && (
          <p className="text-xs font-semibold mb-1 text-gray-600">
            {message.sender.firstName} {message.sender.lastName}
          </p>
        )}

        {parsed.text && <p className="text-sm break-words">{parsed.text}</p>}

        {parsed.attachments.length > 0 && (
          <div className={`space-y-2 ${parsed.text ? "mt-2" : ""}`}>
            {parsed.attachments.map((attachment, index) => {
              const key = `${attachment.fileId || attachment.url}-${index}`;
              const labelColor = isMine ? "text-blue-100" : "text-gray-500";
              const blockClass = isMine
                ? "bg-white/15 border border-white/20"
                : "bg-white/70 border border-gray-200/70";

              if (attachment.isImage) {
                return (
                  <a
                    key={key}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.name || "chat-image"}
                      className="max-h-56 rounded-xl object-cover"
                    />
                    <p className={`mt-1 text-xs ${labelColor}`}>
                      {attachment.name}
                    </p>
                  </a>
                );
              }

              return (
                <a
                  key={key}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between rounded-xl px-3 py-2 ${blockClass}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.name}
                    </p>
                    <p className={`text-xs ${labelColor}`}>
                      {formatFileSize(Number(attachment.size))}
                    </p>
                  </div>
                  <span className="text-xs font-semibold">Tải</span>
                </a>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1">
          <p
            className={`text-xs ${isMine ? "text-orange-100" : "text-gray-500"}`}
          >
            {formatTime(
              message.createdDate || message.createdAt || message.timestamp,
            )}
          </p>
          {message.isPending && <Loader className="w-3 h-3 animate-spin" />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
