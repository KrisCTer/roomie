import React, { useRef } from "react";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Loader,
} from "lucide-react";

const MessageInput = ({
  newMessage,
  sending,
  onMessageChange,
  onSendMessage,
}) => {
  const messageInputRef = useRef(null);

  return (
    <form
      onSubmit={onSendMessage}
      className="p-4 border-t flex items-center gap-3"
    >
      <button
        type="button"
        className="p-2 hover:bg-gray-100 rounded-full transition"
      >
        <Paperclip className="w-5 h-5 text-gray-600" />
      </button>
      <button
        type="button"
        className="p-2 hover:bg-gray-100 rounded-full transition"
      >
        <ImageIcon className="w-5 h-5 text-gray-600" />
      </button>

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
        type="button"
        className="p-2 hover:bg-gray-100 rounded-full transition"
      >
        <Smile className="w-5 h-5 text-gray-600" />
      </button>

      <button
        type="submit"
        disabled={!newMessage.trim() || sending}
        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default MessageInput;
