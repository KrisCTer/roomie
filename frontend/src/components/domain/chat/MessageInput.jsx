import React, { useRef, useState } from "react";
import { Send, Paperclip, Image as ImageIcon, X, Loader } from "lucide-react";
import { formatFileSize } from "../../../utils/chatAttachmentHelpers";

const MessageInput = ({
  newMessage,
  sending,
  onMessageChange,
  onSendMessage,
}) => {
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  const appendFiles = (files) => {
    const nextItems = Array.from(files || []).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      isImage: file.type.startsWith("image/"),
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : "",
    }));

    setAttachments((prev) => {
      const known = new Set(
        prev.map(
          (item) =>
            `${item.file.name}-${item.file.size}-${item.file.lastModified}`,
        ),
      );

      const unique = nextItems.filter(
        (item) =>
          !known.has(
            `${item.file.name}-${item.file.size}-${item.file.lastModified}`,
          ),
      );

      return [...prev, ...unique];
    });
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAttachments = () => {
    attachments.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setAttachments([]);
  };

  const handleSubmit = async (e) => {
    const success = await onSendMessage(e, { attachments });
    if (success) {
      clearAttachments();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex flex-col gap-3">
      {attachments.length > 0 && (
        <div className="w-full rounded-xl border border-white/40 bg-white/30 p-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map((item) => (
              <div
                key={item.id}
                className="relative max-w-[160px] rounded-lg border border-white/50 bg-white/70 p-2"
              >
                <button
                  type="button"
                  onClick={() => removeAttachment(item.id)}
                  className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow"
                >
                  <X className="w-3 h-3" />
                </button>

                {item.isImage ? (
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-20 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="h-20 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 px-2 text-center">
                    Tệp
                  </div>
                )}

                <p className="mt-1 truncate text-xs font-medium">
                  {item.file.name}
                </p>
                <p className="text-[11px] text-gray-500">
                  {formatFileSize(item.file.size)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ImageIcon className="w-5 h-5 text-gray-600" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            appendFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            appendFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <input
          ref={messageInputRef}
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />

        <button
          type="submit"
          disabled={(!newMessage.trim() && attachments.length === 0) || sending}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
