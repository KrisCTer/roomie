// Get conversation display name
export const getConversationName = (conversation, currentUserId) => {
  if (conversation.name || conversation.conversationName) {
    return conversation.name || conversation.conversationName;
  }

  const otherParticipant = conversation.participants?.find(
    (p) => (p.userId || p.id) !== currentUserId
  );

  return (
    otherParticipant?.fullName || otherParticipant?.username || "Unknown User"
  );
};

// Format relative time
export const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return diffInMinutes < 1 ? "Vừa xong" : `${diffInMinutes} phút trước`;
  }
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInHours < 48) return "Hôm qua";
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;

  return date.toLocaleDateString("vi-VN");
};

// Format message time
export const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Scroll to bottom smoothly
export const scrollToBottom = (ref) => {
  setTimeout(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, 100);
};