const MessageItem = ({ message }) => {
  return (
    <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
        {message.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm">{message.name}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0">{message.time}</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
      </div>
    </div>
  );
};

export default MessageItem;